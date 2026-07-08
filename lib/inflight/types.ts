export interface InflightRequestOptions {
  method?: string;
  url?: string;
  query?: Record<string, string>;
  body?: unknown;
  headers?: Record<string, string>;
  userId?: string;
  
  /** 
   * A completely custom key if deterministic hashing of other fields is not desired.
   */
  customKey?: string;
}

export interface InflightConfig {
  /** Maximum time in ms a request can take before timing out (Default: 30000) */
  timeoutMs?: number;
  /** Maximum number of active jobs in memory per instance (Default: 5000) */
  maxActiveJobs?: number;
  /** The TTL for the short-lived synchronization cache (Default: 5s) */
  syncCacheTtlSec?: number;
}

export interface MetricsData {
  localDeduplicated: number;
  distributedDeduplicated: number;
  backendExecutions: number;
  errors: number;
  activeLocalJobs: number;
  peakConcurrency: number;
}

export interface InflightJob<T> {
  promise: Promise<T>;
  createdAt: number;
  timeoutMs: number;
}

export interface Payload<T> {
  success: boolean;
  data?: T;
  error?: string;
}
