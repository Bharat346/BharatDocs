import Redis from 'ioredis';

let redisClient = null;
let pubSubClient = null;
let isRedisAvailable = true;

/**
 * Initialize Redis clients lazily with fail-fast fallback
 */
function initRedis() {
  if (redisClient) return;

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    // Standard Redis client for SET/GET
    redisClient = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 2) {
          isRedisAvailable = false;
          return null; // Stop retrying, fallback to local memory mode
        }
        return 500; // wait 500ms before next retry
      }
    });

    // Dedicated Pub/Sub client
    pubSubClient = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null 
    });

    // Suppress unhandled error crashes if redis is down
    redisClient.on('error', () => { isRedisAvailable = false; });
    pubSubClient.on('error', () => { isRedisAvailable = false; });
    
  } catch (err) {
    isRedisAvailable = false;
  }
}

export function isDistributedEnabled() {
  if (process.env.DISABLE_DISTRIBUTED_COALESCER === 'true') return false;
  initRedis();
  return isRedisAvailable && redisClient?.status !== 'end';
}

/**
 * Attempts to acquire a distributed lock.
 * @returns {Promise<boolean>} True if lock acquired or fallback mode, False if someone else holds it.
 */
export async function acquireLock(key, ttlMs) {
  if (!isDistributedEnabled()) return true; 
  try {
    const result = await redisClient.set(`lock:${key}`, '1', 'NX', 'PX', ttlMs);
    return result === 'OK';
  } catch (err) {
    console.warn('[Coalescer] Redis lock failed, falling back to local mode.', err.message);
    isRedisAvailable = false;
    return true; 
  }
}

/**
 * Releases the distributed lock.
 */
export async function releaseLock(key) {
  if (!isDistributedEnabled()) return;
  try {
    await redisClient.del(`lock:${key}`);
  } catch (err) {
    // Silent fail
  }
}

/**
 * Saves result to Redis cache and notifies waiting servers.
 */
export async function publishResult(key, data) {
  if (!isDistributedEnabled()) return;
  try {
    const payload = JSON.stringify({ success: true, data });
    await redisClient.set(`cache:${key}`, payload, 'EX', 60); // 60s TTL for the result
    await redisClient.publish(`channel:${key}`, 'DONE');
  } catch (err) {
    // Silent fail
  }
}

/**
 * Saves error to Redis cache and notifies waiting servers.
 */
export async function publishError(key, errorMsg) {
  if (!isDistributedEnabled()) return;
  try {
    const payload = JSON.stringify({ success: false, error: errorMsg });
    await redisClient.set(`cache:${key}`, payload, 'EX', 10); 
    await redisClient.publish(`channel:${key}`, 'DONE');
  } catch (err) {
    // Silent fail
  }
}

/**
 * Subscribes to the channel and waits for another server to publish the result.
 */
export async function waitForDistributedResult(key, timeoutMs) {
  return new Promise((resolve, reject) => {
    let timeoutId;
    
    const handleMessage = async (channel, message) => {
      if (channel === `channel:${key}` && message === 'DONE') {
        cleanup();
        try {
          const cachedStr = await redisClient.get(`cache:${key}`);
          if (!cachedStr) return reject(new Error('Missing payload from distributed worker'));
          
          const payload = JSON.parse(cachedStr);
          if (payload.success) resolve(payload.data);
          else reject(new Error(payload.error));
        } catch (e) {
          reject(e);
        }
      }
    };

    const cleanup = () => {
      clearTimeout(timeoutId);
      pubSubClient.unsubscribe(`channel:${key}`).catch(() => {});
      pubSubClient.off('message', handleMessage);
    };

    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Distributed wait timeout for key: ${key}`));
    }, timeoutMs);

    pubSubClient.subscribe(`channel:${key}`).catch(err => {
      cleanup();
      reject(err);
    });
    
    pubSubClient.on('message', handleMessage);

    // CRITICAL RACE CONDITION PREVENTION:
    // Check if the result was already published just BEFORE we successfully subscribed.
    redisClient.get(`cache:${key}`).then(cachedStr => {
      if (cachedStr) {
        cleanup();
        const payload = JSON.parse(cachedStr);
        if (payload.success) resolve(payload.data);
        else reject(new Error(payload.error));
      }
    }).catch(() => {});
  });
}
