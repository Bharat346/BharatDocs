import { RequestCoalescer } from '../../lib/coalescer/index.js';

describe('Request Coalescer - Core Logic', () => {
  let coalescer;

  beforeEach(() => {
    coalescer = new RequestCoalescer();
  });

  afterEach(() => {
    coalescer.clear();
  });

  it('should execute a backend function only once for identical concurrent requests', async () => {
    let executionCount = 0;
    const requestOptions = { route: '/api/test' };

    const backendTask = async () => {
      executionCount++;
      return new Promise((resolve) => setTimeout(() => resolve('success'), 50));
    };

    // Fire 5 identical concurrent requests
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(coalescer.execute(requestOptions, backendTask));
    }

    const results = await Promise.all(promises);

    expect(executionCount).toBe(1); // Only executed once!
    expect(results.every(r => r === 'success')).toBe(true);
    expect(coalescer.activeJobs.size).toBe(0); // Cleanup successful
  });

  it('should execute separate backend functions for different requests', async () => {
    let executionCount = 0;
    
    const backendTask = async () => {
      executionCount++;
      return new Promise((resolve) => setTimeout(() => resolve('success'), 50));
    };

    const req1 = { route: '/api/a' };
    const req2 = { route: '/api/b' };

    await Promise.all([
      coalescer.execute(req1, backendTask),
      coalescer.execute(req2, backendTask)
    ]);

    expect(executionCount).toBe(2);
  });

  it('should timeout and cleanup correctly', async () => {
    const requestOptions = { route: '/api/slow' };
    
    const slowBackendTask = async () => {
      return new Promise((resolve) => setTimeout(() => resolve('done'), 1000));
    };

    // Set timeout to 50ms, which is much faster than the 1000ms task
    await expect(coalescer.execute(requestOptions, slowBackendTask, { timeoutMs: 50 }))
      .rejects
      .toThrow(/Timeout/);

    // Ensure the job was removed from the active registry despite the error
    expect(coalescer.activeJobs.size).toBe(0);
  });
});
