import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in environment variables");
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Helper to get data from cache or fetch from DB and store in cache
 * @param {string} key Cache key
 * @param {Function} fetcher Function to fetch data if not in cache
 * @param {number} ttl TTL in seconds (default 1 hour)
 */
let redisErrorOccurred = false;

export async function getCachedData(key, fetcher, ttl = 3600) {
  if (!redisErrorOccurred) {
    try {
      const cached = await redis.get(key);
      if (cached) {
        console.log(`[Redis] Cache Hit: ${key}`);
        return cached;
      }
    } catch (error) {
      console.warn(`[Redis] Read error. Disabling Redis for this session. (${error.message})`);
      redisErrorOccurred = true;
    }
  }

  const data = await fetcher();

  if (!redisErrorOccurred && data !== undefined && data !== null) {
    try {
      await redis.set(key, data, { ex: ttl });
      console.log(`[Redis] Cache Miss: ${key}. Stored in cache.`);
    } catch (error) {
      console.warn(`[Redis] Write error. Disabling Redis for this session. (${error.message})`);
      redisErrorOccurred = true;
    }
  }

  return data;
}
