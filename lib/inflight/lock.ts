import { getRedisClient, isDistributedEnabled } from './redis';
import { logger } from './logger';

let hasLoggedLockWarning = false;

/**
 * Attempts to acquire a distributed lock for the given request key.
 * 
 * @param key The unique request key
 * @param ttlMs Time to live for the lock (crash recovery timeout)
 * @returns boolean True if lock acquired, False if someone else holds it.
 */
export async function acquireLock(key: string, ttlMs: number): Promise<boolean> {
  if (!isDistributedEnabled()) {
    return true; // Local mode always "gets" the lock
  }

  try {
    const client = getRedisClient();
    // SETNX with PX ensures the lock is exclusively acquired and expires automatically
    const result = await client.set(`inflight:lock:${key}`, '1', 'PX', ttlMs, 'NX');
    return result === 'OK';
  } catch (err) {
    if (!hasLoggedLockWarning) {
      logger.warn(`Failed to acquire Redis lock for ${key}, falling back to local mode`, err);
      hasLoggedLockWarning = true;
    }
    return true; // Fail open to local execution to avoid starvation
  }
}

/**
 * Releases the distributed lock.
 * 
 * @param key The unique request key
 */
export async function releaseLock(key: string): Promise<void> {
  if (!isDistributedEnabled()) return;

  try {
    const client = getRedisClient();
    await client.del(`inflight:lock:${key}`);
  } catch (err) {
    logger.error(`Failed to release Redis lock for ${key}`, err);
    // Silent fail, it will expire via TTL anyway
  }
}
