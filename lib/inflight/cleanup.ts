import { InflightJob } from './types';
import { logger } from './logger';

export interface CleanupTarget {
  activeJobs: Record<string, InflightJob<any> | null>;
  decrementActiveJobsCount(): void;
}

export class CleanupWatchdog {
  private intervalId: NodeJS.Timeout | null = null;
  private target: CleanupTarget;

  constructor(target: CleanupTarget) {
    this.target = target;
  }

  start() {
    if (this.intervalId) return;

    // Run every 5 seconds to clear out dead keys in one bulk operation
    this.intervalId = setInterval(() => {
      this.runCleanup();
    }, 5000);

    // Unref so it doesn't prevent Node from exiting
    if (this.intervalId.unref) {
      this.intervalId.unref();
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private runCleanup() {
    const now = Date.now();
    const activeJobs = this.target.activeJobs;
    for (const key in activeJobs) {
      const job = activeJobs[key];
      if (job === null) {
        // Clear out dead key in bulk
        delete activeJobs[key];
      } else if (job && now - job.createdAt > job.timeoutMs + 10000) {
        // If the job has lived 10 seconds past its timeout, forcibly remove it
        logger.warn(`Watchdog terminating stale hanging job: ${key}`);
        delete activeJobs[key];
        this.target.decrementActiveJobsCount();
      }
    }
  }
}
