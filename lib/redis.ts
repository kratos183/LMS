import Redis from 'ioredis';

// Global singleton instance for serverless / Next.js API routes
declare global {
  // eslint-disable-next-line no-var
  var _redisInstance: Redis | undefined;
}

/**
 * Returns a resilient Redis client.
 * Supports REDIS_URL (e.g. redis://127.0.0.1:6379 or Upstash Redis URL)
 * Gracefully falls back if Redis is unreachable.
 */
export function getRedisClient(): Redis | null {
  if (global._redisInstance) {
    return global._redisInstance;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) return null; // Do not block if Redis is offline
        return Math.min(times * 200, 1000);
      },
    });

    client.on('error', (err) => {
      console.warn('[Redis] Connection warning:', err.message);
    });

    global._redisInstance = client;
    return client;
  } catch (error) {
    console.warn('[Redis] Initialization error:', error);
    return null;
  }
}

/**
 * Helper to get cached data or fetch fresh data using the Cache-Aside pattern
 * @param key Redis cache key
 * @param ttlSeconds Time-to-live in seconds (default 3600 = 1 hour)
 * @param fetcher Async function to fetch fresh data if cache misses
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
        return { data: JSON.parse(cached) as T, source: 'cache' };
      }
    } catch (err) {
      console.warn(`[Redis] Failed to read key "${key}":`, err);
    }
  }

  // Cache miss or Redis unavailable — fetch from database
  const freshData = await fetcher();

  if (redis && freshData) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(freshData));
    } catch (err) {
      console.warn(`[Redis] Failed to write key "${key}":`, err);
    }
  }

  return { data: freshData, source: 'database' };
}

/**
 * Invalidate one or more cache keys upon database writes (INSERT/UPDATE/DELETE)
 */
export async function invalidateCache(...keys: string[]): Promise<void> {
  const redis = getRedisClient();
  if (!redis || keys.length === 0) return;

  try {
    await redis.del(...keys);
  } catch (err) {
    console.warn('[Redis] Failed to invalidate keys:', keys, err);
  }
}
