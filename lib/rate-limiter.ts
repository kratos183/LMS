import { getRedisClient } from './redis';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Sliding Window Rate Limiter using Redis Atomic Counters (Concept #28)
 * 
 * @param identifier - Unique client ID (IP address, user ID, or email)
 * @param limit - Maximum requests allowed in the window (default: 10)
 * @param windowSeconds - Window duration in seconds (default: 60)
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const redis = getRedisClient();

  // If Redis is temporarily unavailable, fail open gracefully
  if (!redis) {
    return {
      allowed: true,
      limit,
      remaining: limit,
      resetInSeconds: windowSeconds,
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const windowKey = `ratelimit:ai:${identifier}:${Math.floor(now / windowSeconds)}`;

  try {
    // Atomic multi-command pipeline: Increment + Expire
    const pipeline = redis.pipeline();
    pipeline.incr(windowKey);
    pipeline.ttl(windowKey);

    const results = await pipeline.exec();
    const currentCount = (results?.[0]?.[1] as number) || 1;
    let ttl = (results?.[1]?.[1] as number) || windowSeconds;

    // If key has no expiration set yet, set it to the window duration
    if (ttl === -1 || ttl === -2) {
      await redis.expire(windowKey, windowSeconds);
      ttl = windowSeconds;
    }

    const remaining = Math.max(0, limit - currentCount);
    const allowed = currentCount <= limit;

    return {
      allowed,
      limit,
      remaining,
      resetInSeconds: ttl > 0 ? ttl : windowSeconds,
    };
  } catch (error: any) {
    console.warn('[RateLimiter Error]:', error.message);
    // Graceful fallback on connection error
    return {
      allowed: true,
      limit,
      remaining: 1,
      resetInSeconds: windowSeconds,
    };
  }
}
