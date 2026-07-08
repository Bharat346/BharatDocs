import { InflightManager } from '../../lib/inflight/manager';

describe('InFlight Manager - Concurrency', () => {
  let manager: InflightManager;

  beforeEach(() => {
    // Disable distributed mode for unit tests
    process.env.DISABLE_DISTRIBUTED_INFLIGHT = 'true';
    manager = new InflightManager();
  });

  afterEach(() => {
    manager.clear();
    delete process.env.DISABLE_DISTRIBUTED_INFLIGHT;
  });

  it('should execute backend task exactly once for concurrent identical requests', async () => {
    let executionCount = 0;
    const requestOptions = { url: '/api/test' };

    const backendTask = async () => {
      executionCount++;
      return new Promise((resolve) => setTimeout(() => resolve('success'), 100));
    };

    // Fire 50 identical concurrent requests
    const promises = [];
    for (let i = 0; i < 50; i++) {
      promises.push(manager.execute(requestOptions, backendTask));
    }

    const results = await Promise.all(promises);

    expect(executionCount).toBe(1); // Executed exactly once
    expect(results.every((r) => r === 'success')).toBe(true);

    const metrics = manager.getMetrics();
    expect(metrics.localDeduplicated).toBe(49);
    expect(metrics.backendExecutions).toBe(1);
  });

  it('should execute separately for different requests', async () => {
    let executionCount = 0;

    const backendTask = async () => {
      executionCount++;
      return new Promise((resolve) => setTimeout(() => resolve('success'), 100));
    };

    const req1 = { url: '/api/test?id=1' };
    const req2 = { url: '/api/test?id=2' };

    await Promise.all([
      manager.execute(req1, backendTask),
      manager.execute(req2, backendTask),
    ]);

    expect(executionCount).toBe(2);
  });

  it('should enforce timeouts and release memory', async () => {
    const requestOptions = { url: '/api/timeout' };

    const slowBackendTask = async () => {
      return new Promise((resolve) => setTimeout(() => resolve('done'), 1000));
    };

    // Set timeout to 50ms
    await expect(
      manager.execute(requestOptions, slowBackendTask, 50)
    ).rejects.toThrow(/InFlight Timeout/);

    // Job should be removed from memory
    const metrics = manager.getMetrics();
    expect(metrics.activeLocalJobs).toBe(0);
  });
});
