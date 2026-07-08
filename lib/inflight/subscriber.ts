import { getRedisClient, getPubSubClient } from './redis';
import { Payload } from './types';
import { logger } from './logger';

/**
 * Subscribes to the distributed lock channel and waits for the coordinator to finish.
 * Includes a timeout mechanism and strict race-condition mitigation using a short-lived sync cache.
 */
export async function waitForDistributedResult<T>(key: string, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout;
    const client = getRedisClient();
    const pubSub = getPubSubClient();
    const channelName = `inflight:channel:${key}`;
    const syncKey = `inflight:sync:${key}`;

    const cleanup = () => {
      clearTimeout(timeoutId);
      pubSub.unsubscribe(channelName).catch(() => {});
      pubSub.off('message', handleMessage);
    };

    const processPayload = (payloadStr: string | null) => {
      if (!payloadStr) {
        reject(new Error('Missing payload from distributed coordinator'));
        return;
      }
      try {
        const payload: Payload<T> = JSON.parse(payloadStr);
        if (payload.success) {
          resolve(payload.data as T);
        } else {
          reject(new Error(payload.error || 'Unknown distributed error'));
        }
      } catch (err) {
        reject(new Error('Failed to parse distributed payload'));
      }
    };

    const handleMessage = async (channel: string, message: string) => {
      if (channel === channelName && message === 'DONE') {
        cleanup();
        try {
          const cachedStr = await client.get(syncKey);
          processPayload(cachedStr);
        } catch (e) {
          reject(e);
        }
      }
    };

    // 1. Timeout failsafe
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Distributed wait timeout for key: ${key} after ${timeoutMs}ms`));
    }, timeoutMs);

    // 2. Subscribe to the channel
    pubSub.subscribe(channelName).catch((err) => {
      cleanup();
      reject(err);
    });
    
    pubSub.on('message', handleMessage);

    // 3. Race condition check
    // If the publisher finished JUST BEFORE we subscribed, we would miss the "DONE" message.
    // By querying the sync key right after subscription, we ensure we catch it.
    client.get(syncKey).then((cachedStr) => {
      if (cachedStr) {
        cleanup();
        processPayload(cachedStr);
      }
    }).catch((err) => {
      logger.warn(`Error checking sync key for race condition: ${key}`, err);
    });
  });
}
