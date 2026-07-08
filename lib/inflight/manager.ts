import { InflightRequestOptions, InflightConfig, InflightJob } from './types';
import { generateRequestKey } from './requestKey';
import { metrics } from './metrics';
import { acquireLock, releaseLock } from './lock';
import { runCoordinator } from './coordinator';
import { waitForDistributedResult } from './subscriber';
import { CleanupWatchdog } from './cleanup';
import { logger } from './logger';

export class InflightManager {
  public activeJobs: Record<string, InflightJob<any> | null> = Object.create(null);
  private activeJobsCount = 0;
  private watchdog: CleanupWatchdog;
  
  private maxActiveJobs: number;
  private defaultTimeoutMs: number;
  private syncCacheTtlSec: number;

  constructor(config: InflightConfig = {}) {
    this.maxActiveJobs = config.maxActiveJobs || 5000;
    this.defaultTimeoutMs = config.timeoutMs || 30000;
    this.syncCacheTtlSec = config.syncCacheTtlSec || 5;
    
    this.watchdog = new CleanupWatchdog(this);
    this.watchdog.start();
  }

  public decrementActiveJobsCount() {
    this.activeJobsCount--;
    metrics.updateActiveJobs(this.activeJobsCount);
  }

  /**
   * Executes a backend task ensuring it only runs exactly once globally across all servers.
   * Concurrent duplicate requests will join the execution.
   */
  async execute<T>(
    options: InflightRequestOptions,
    backendTaskFn: () => Promise<T>,
    customTimeoutMs?: number
  ): Promise<T> {
    const key = generateRequestKey(options);
    const timeoutMs = customTimeoutMs || this.defaultTimeoutMs;

    // 1. Local Memory In-Flight Deduplication (O(1))
    const existingJob = this.activeJobs[key];
    if (existingJob) {
      metrics.recordLocalHit();
      return existingJob.promise;
    }

    if (this.activeJobsCount >= this.maxActiveJobs) {
      throw new Error(`InflightManager queue overflow: Max ${this.maxActiveJobs} active jobs reached.`);
    }

    // 2. Register job locally before async operations to prevent race conditions
    let resolveJob!: (value: T) => void;
    let rejectJob!: (reason?: any) => void;
    const jobPromise = new Promise<T>((res, rej) => {
      resolveJob = res;
      rejectJob = rej;
    });

    this.activeJobs[key] = {
      promise: jobPromise,
      createdAt: Date.now(),
      timeoutMs,
    };
    this.activeJobsCount++;
    metrics.updateActiveJobs(this.activeJobsCount);

    // 3. Delegate to Distributed execution without blocking the local map registration
    this._runDistributedJob(key, backendTaskFn, timeoutMs)
      .then(resolveJob)
      .catch(rejectJob)
      .finally(() => {
        // Batch mutations: mark as dirty for the background job to clean up
        if (this.activeJobs[key]) {
          this.activeJobs[key] = null;
          this.activeJobsCount--;
          metrics.updateActiveJobs(this.activeJobsCount);
        }
      });

    return jobPromise;
  }

  /**
   * Internal routine to acquire lock and run as Coordinator or Subscriber
   */
  private async _runDistributedJob<T>(
    key: string,
    backendTaskFn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    let hasLock = false;

    try {
      // 1. Attempt Distributed Lock
      hasLock = await acquireLock(key, timeoutMs);

      if (!hasLock) {
        // We are a Subscriber. Wait for the Coordinator.
        metrics.recordDistributedHit();
        return await waitForDistributedResult<T>(key, timeoutMs);
      }

      // 2. We are the Coordinator.
      metrics.recordExecution();
      return await runCoordinator<T>(key, backendTaskFn, timeoutMs, this.syncCacheTtlSec);

    } catch (err: any) {
      metrics.recordError();
      throw err;
    } finally {
      // 3. Coordinator releases lock immediately after publishing
      if (hasLock) {
        await releaseLock(key);
      }
    }
  }

  /**
   * Forcibly clear local state (useful for testing)
   */
  clear() {
    this.activeJobs = Object.create(null);
    this.activeJobsCount = 0;
    metrics.reset();
  }

  /**
   * Retrieve real-time metrics
   */
  getMetrics() {
    return metrics.getMetrics();
  }
}

// Export a singleton instance for ease of use across the application
export const inflightManager = new InflightManager();
