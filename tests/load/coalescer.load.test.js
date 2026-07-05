import { globalCoalescer } from '../../lib/coalescer/index.js';

describe('Request Coalescer - Load Testing', () => {
  afterEach(() => {
    globalCoalescer.clear();
  });

  it('should successfully handle 10,000 concurrent identical requests with a single backend execution', async () => {
    let backendExecutionCount = 0;
    
    const mockDatabaseQuery = async () => {
      backendExecutionCount++;
      // Simulate network/db latency of 100ms
      return new Promise((resolve) => setTimeout(() => resolve({ 
        data: 'Highly sought after resource!', 
        timestamp: Date.now() 
      }), 100));
    };

    const requestOptions = {
      method: 'GET',
      route: '/api/popular-document',
      queryParams: { id: '123' },
      tenantId: 'tenant-a'
    };

    const REQUEST_COUNT = 10000;
    const promises = [];
    
    for (let i = 0; i < REQUEST_COUNT; i++) {
      promises.push(globalCoalescer.execute(requestOptions, mockDatabaseQuery));
    }

    const results = await Promise.all(promises);

    expect(backendExecutionCount).toBe(1); // The core requirement!
    expect(results.length).toBe(REQUEST_COUNT);
    
    // Verify all clients received identical response objects
    const firstResult = results[0];
    const allIdentical = results.every(res => res.timestamp === firstResult.timestamp);
    expect(allIdentical).toBe(true);

    // Verify memory is cleaned up
    expect(globalCoalescer.activeJobs.size).toBe(0);
  });
});
