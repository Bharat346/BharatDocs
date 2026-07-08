import Redis from 'ioredis';
import { logger } from './logger';

let redisClient: Redis | null = null;
let pubSubClient: Redis | null = null;
let isRedisAvailable = true;
let hasLoggedConnectionError = false;

export function initRedis() {
  if (redisClient) return;

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    // Standard Redis client for SET/GET/DEL
    redisClient = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 2) {
          logger.error('Redis connection failed after retries. Falling back to local mode.');
          isRedisAvailable = false;
          return null; // Stop retrying
        }
        return Math.min(times * 100, 3000); // Exponential backoff
      }
    });

    // Dedicated Pub/Sub client
    pubSubClient = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null // Don't block forever
    });

    redisClient.on('error', (err) => {
      if (!hasLoggedConnectionError) {
        logger.error('Redis client error', err);
        hasLoggedConnectionError = true;
      }
      isRedisAvailable = false;
    });

    pubSubClient.on('error', (err) => {
      if (!hasLoggedConnectionError) {
        logger.error('Redis pubSubClient error', err);
        hasLoggedConnectionError = true;
      }
      isRedisAvailable = false;
    });

    redisClient.on('ready', () => {
      isRedisAvailable = true;
    });

  } catch (err) {
    logger.error('Failed to initialize Redis clients', err);
    isRedisAvailable = false;
  }
}

export function isDistributedEnabled(): boolean {
  if (process.env.DISABLE_DISTRIBUTED_INFLIGHT === 'true') return false;
  initRedis();
  return isRedisAvailable && redisClient?.status !== 'end';
}

export function getRedisClient(): Redis {
  initRedis();
  if (!redisClient) throw new Error('Redis client not initialized');
  return redisClient;
}

export function getPubSubClient(): Redis {
  initRedis();
  if (!pubSubClient) throw new Error('Redis pubSubClient not initialized');
  return pubSubClient;
}
