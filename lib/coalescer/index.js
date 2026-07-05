import { generateRequestKey } from './fingerprint.js';
import { acquireLock, releaseLock, publishResult, publishError, waitForDistributedResult, isDistributedEnabled } from './redis.js';
import { cached } from '../cache/lru.js';

class RequestCoalescer {
  constructor(options = {}) {
    this.activeJobs = new Map();

    // Memory Protection Limits
    this.MAX_JOBS = options.maxJobs || 5000;

    // Observability & Metrics
    this.metrics = {
      coalescedCount: 0,
      backendExecutions: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0
    };

    // Watchdog TTL Cleanup: Ensures stale jobs are forcibly pruned if they somehow evade Promise.race
    this.watchdogInterval = setInterval(() => this._runWatchdog(), 60000);
    if (this.watchdogInterval.unref) this.watchdogInterval.unref();
  }

  getMetrics() {
    return {
      ...this.metrics,
      activeJobs: this.activeJobs.size,
      distributedEnabled: isDistributedEnabled()
    };
  }

  clear() {
    this.activeJobs.clear();
  }

  _runWatchdog() {
    const now = Date.now();
    for (const [key, job] of this.activeJobs.entries()) {
      if (now - job.createdAt > (job.timeoutMs + 5000)) {
        console.warn(`[Coalescer Watchdog] Terminating stale hanging job: ${key}`);
        this.activeJobs.delete(key);
      }
    }
  }

  /**
   * Executes a backend task with full coalescing, caching, memory limits, and distributed locks.
   *
   * @param {Object} requestOptions - Options to generate the deterministic request key.
   * @param {Function} backendTaskFn - Async function that performs the actual backend work.
   * @param {Object} [options] - Additional configuration options.
   * @param {number} [options.timeoutMs=30000] - Timeout in milliseconds. Default 30s.
   * @param {boolean} [options.useCache=false] - Whether to utilize the LRU memory cache.
   * @param {string} [options.cacheNamespace='queries'] - Cache namespace to use.
   * @returns {Promise<any>} The resolved result of the backend task.
   */
  async execute(requestOptions, backendTaskFn, options = {}) {
    const { timeoutMs = 30000, useCache = false, cacheNamespace = 'queries' } = options;
    const requestKey = generateRequestKey(requestOptions);

    // 1. Smart Caching Layer (Fastest Path - bypasses coalescer entirely if hit)
    if (useCache) {
      try {
        // Probe the cache without overwriting
        const cachedResult = await cached(cacheNamespace, requestKey, async () => undefined);
        if (cachedResult !== undefined) {
          this.metrics.cacheHits++;
          return cachedResult;
        }
      } catch (err) {
        // Ignore cache errors, fallback to backend
      }
      this.metrics.cacheMisses++;
    }

    // 2. Local In-Memory Coalescing (Single-Flight)
    if (this.activeJobs.has(requestKey)) {
      this.metrics.coalescedCount++;
      return this.activeJobs.get(requestKey).promise;
    }

    // 3. Memory Protection Layer (Prevent Queue Overflow)
    if (this.activeJobs.size >= this.MAX_JOBS) {
      throw new Error(`Coalescer queue overflow: Max ${this.MAX_JOBS} active jobs reached.`);
    }

    // 4. Atomic Job Registration
    // We register the promise synchronously before any async operations to prevent event-loop race conditions
    let resolveJob, rejectJob;
    const jobPromise = new Promise((res, rej) => {
      resolveJob = res;
      rejectJob = rej;
    });

    this.activeJobs.set(requestKey, {
      promise: jobPromise,
      createdAt: Date.now(),
      timeoutMs
    });

    // 5. Execute Job with Distributed Locks
    // We run this detached from the main execution thread so the local Map handles the state.
    this._runDistributedJob(requestKey, backendTaskFn, timeoutMs, resolveJob, rejectJob, useCache, cacheNamespace)
      .finally(() => {
        // Guarantee memory cleanup
        this.activeJobs.delete(requestKey);
      });

    return jobPromise;
  }

  /**
   * Internal routine for acquiring distributed locks and executing the backend logic.
   * @private
   */
  async _runDistributedJob(key, backendTaskFn, timeoutMs, resolve, reject, useCache, cacheNamespace) {
    let hasLock = false;

    try {
      // 1. Attempt Distributed Lock
      hasLock = await acquireLock(key, timeoutMs);

      if (!hasLock) {
        // Another server holds the lock. Wait via Pub/Sub.
        this.metrics.coalescedCount++;
        const result = await waitForDistributedResult(key, timeoutMs);
        return resolve(result);
      }

      // 2. We have the lock, execute the actual backend logic
      this.metrics.backendExecutions++;
      const result = await this._executeWithTimeout(backendTaskFn, timeoutMs);

      // 3. Save to Local Memory Cache (if enabled)
      if (useCache && result !== undefined && result !== null) {
        await cached(cacheNamespace, key, async () => result);
      }

      // 4. Publish to other servers via Redis
      await publishResult(key, result);

      resolve(result);

    } catch (err) {
      this.metrics.errors++;
      if (hasLock) await publishError(key, err.message);
      reject(err);
    } finally {
      if (hasLock) await releaseLock(key);
    }
  }

  async _executeWithTimeout(backendTaskFn, timeoutMs) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`RequestCoalescer Timeout: Job exceeded ${timeoutMs}ms limit.`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([
        backendTaskFn(),
        timeoutPromise
      ]);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const globalCoalescer = new RequestCoalescer();
export { RequestCoalescer, generateRequestKey };
