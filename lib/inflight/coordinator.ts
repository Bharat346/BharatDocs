import { publishResult, publishError } from './publisher';

/**
 * Executes the backend task with a strict timeout.
 * 
 * @param backendTaskFn The actual expensive async function to run
 * @param timeoutMs The maximum allowed time for execution
 * @returns The resolved result
 */
async function executeWithTimeout<T>(backendTaskFn: () => Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`InFlight Timeout: Job exceeded ${timeoutMs}ms limit.`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([backendTaskFn(), timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

/**
 * Acts as the Coordinator. This is called only when the server has successfully
 * acquired the distributed lock. It is responsible for executing the task,
 * and publishing the result (success or error) to all waiting subscribers.
 */
export async function runCoordinator<T>(
  key: string,
  backendTaskFn: () => Promise<T>,
  timeoutMs: number,
  syncCacheTtlSec: number
): Promise<T> {
  try {
    const result = await executeWithTimeout(backendTaskFn, timeoutMs);
    // Publish the result to distributed subscribers
    await publishResult(key, result, syncCacheTtlSec);
    return result;
  } catch (err: any) {
    // Publish the error to distributed subscribers
    await publishError(key, err.message || 'Unknown error', syncCacheTtlSec);
    throw err;
  }
}
