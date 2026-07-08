import { MetricsData } from './types';

export class InflightMetrics {
  private data: MetricsData = {
    localDeduplicated: 0,
    distributedDeduplicated: 0,
    backendExecutions: 0,
    errors: 0,
    activeLocalJobs: 0,
    peakConcurrency: 0,
  };

  recordLocalHit() {
    this.data.localDeduplicated++;
  }

  recordDistributedHit() {
    this.data.distributedDeduplicated++;
  }

  recordExecution() {
    this.data.backendExecutions++;
  }

  recordError() {
    this.data.errors++;
  }

  updateActiveJobs(count: number) {
    this.data.activeLocalJobs = count;
    if (count > this.data.peakConcurrency) {
      this.data.peakConcurrency = count;
    }
  }

  getMetrics(): MetricsData {
    return { ...this.data };
  }

  reset() {
    this.data = {
      localDeduplicated: 0,
      distributedDeduplicated: 0,
      backendExecutions: 0,
      errors: 0,
      activeLocalJobs: 0,
      peakConcurrency: 0,
    };
  }
}

export const metrics = new InflightMetrics();
