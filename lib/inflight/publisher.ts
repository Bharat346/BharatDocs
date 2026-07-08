import { getRedisClient, isDistributedEnabled } from './redis';
import { logger } from './logger';
import { Payload } from './types';

/**
 * Publishes a successful execution result to all waiting subscribers.
 * We store the result in a short-lived sync key to prevent race conditions 
 * where a subscriber connects slightly after the broadcast.
 */
export async function publishResult<T>(key: string, data: T, syncCacheTtlSec: number = 5): Promise<void> {
  if (!isDistributedEnabled()) return;

  try {
    const client = getRedisClient();
    const payload: Payload<T> = { success: true, data };
    
    // Stringify if necessary (assumes data is JSON serializable)
    const payloadStr = JSON.stringify(payload);
    
    // 1. Save to short-lived sync cache (e.g. 5 seconds TTL)
    await client.set(`inflight:sync:${key}`, payloadStr, 'EX', syncCacheTtlSec);
    
    // 2. Broadcast DONE signal to awaken blocked subscribers
    await client.publish(`inflight:channel:${key}`, 'DONE');
  } catch (err) {
    logger.error(`Failed to publish result for ${key}`, err);
  }
}

/**
 * Publishes an error execution result to all waiting subscribers.
 */
export async function publishError(key: string, errorMsg: string, syncCacheTtlSec: number = 5): Promise<void> {
  if (!isDistributedEnabled()) return;

  try {
    const client = getRedisClient();
    const payload: Payload<any> = { success: false, error: errorMsg };
    
    const payloadStr = JSON.stringify(payload);
    
    await client.set(`inflight:sync:${key}`, payloadStr, 'EX', syncCacheTtlSec);
    await client.publish(`inflight:channel:${key}`, 'DONE');
  } catch (err) {
    logger.error(`Failed to publish error for ${key}`, err);
  }
}
