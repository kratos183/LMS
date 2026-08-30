import Redis from 'ioredis';

// Global singleton instance for Next.js Node runtime
declare global {
  // eslint-disable-next-line no-var
  var _redisInstance: Redis | undefined;
}

/**
 * Returns a singleton Redis client connected to REDIS_URL or local Redis.
 */
export function getRedisClient(): Redis | null {
  if (global._redisInstance) {
    return global._redisInstance;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      connectTimeout: 5000,
      enableOfflineQueue: true,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying after 3 failed attempts
        return Math.min(times * 200, 1000);
      },
    });

    client.on('connect', () => {
      console.log('[Redis] Successfully connected to Redis server at', redisUrl);
    });

    client.on('error', (err) => {
      console.warn('[Redis] Connection error:', err.message);
    });

    global._redisInstance = client;
    return client;
  } catch (error) {
    console.warn('[Redis] Initialization failed:', error);
    return null;
  }
}

/**
 * Cache-Aside Pattern:
 * 1. Checks Redis cache.
 * 2. If HIT -> returns cached object.
 * 3. If MISS -> executes fetcher(), caches result with TTL, returns data.
 */
export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<{ data: T; source: 'cache' | 'database' }> {
  const redis = getRedisClient();

  if (redis) {
    try {
      const cached = await redis.get(key);
      if (cached) {
        console.log(`[Redis CACHE HIT] Key: "${key}"`);
        return { data: JSON.parse(cached) as T, source: 'cache' };
      }
    } catch (err: any) {
      console.warn(`[Redis] Error getting key "${key}":`, err.message);
    }
  }

  // Cache MISS -> fetch fresh data from database
  console.log(`[Redis CACHE MISS] Fetching from database for key: "${key}"`);
  const freshData = await fetcher();

  if (redis && freshData !== undefined && freshData !== null) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(freshData));
      console.log(`[Redis CACHE SET] Saved key: "${key}" (TTL: ${ttlSeconds}s)`);
    } catch (err: any) {
      console.warn(`[Redis] Error setting key "${key}":`, err.message);
    }
  }

  return { data: freshData, source: 'database' };
}

/**
 * Invalidate one or more cache keys on write operations
 */
export async function invalidateCache(...keys: string[]): Promise<void> {
  const redis = getRedisClient();
  if (!redis || keys.length === 0) return;

  try {
    const deletedCount = await redis.del(...keys);
    console.log(`[Redis INVALIDATE] Evicted ${deletedCount} keys:`, keys);
  } catch (err: any) {
    console.warn('[Redis] Failed to invalidate keys:', keys, err.message);
  }
}
