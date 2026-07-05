import { globalCoalescer } from '../lib/coalescer/index.js';

// A mock slow backend function
let backendExecutionCount = 0;

async function mockDatabaseQuery() {
  backendExecutionCount++;
  console.log(`[Backend] Executing heavy database query... (Execution #${backendExecutionCount})`);
  
  // Simulate network/db latency of 1 second
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: 'Highly sought after resource!',
        timestamp: Date.now()
      });
    }, 1000);
  });
}

async function runBenchmark() {
  console.log('--- Starting Request Coalescing Benchmark ---\n');
  
  const REQUEST_COUNT = 10000;
  console.log(`Firing ${REQUEST_COUNT} concurrent identical requests...`);
  
  const requestOptions = {
    method: 'GET',
    route: '/api/popular-document',
    queryParams: { id: '123' },
    tenantId: 'tenant-a'
  };

  const startTime = Date.now();

  // Fire 10,000 concurrent requests
  const promises = [];
  for (let i = 0; i < REQUEST_COUNT; i++) {
    // Pass the exact same options. The coalescer should route them all to a single backend job.
    promises.push(
      globalCoalescer.execute(requestOptions, mockDatabaseQuery)
    );
  }

  // Wait for all to finish
  const results = await Promise.all(promises);
  const endTime = Date.now();
  
  const duration = endTime - startTime;
  
  console.log(`\n--- Benchmark Results ---`);
  console.log(`Total Requests: ${REQUEST_COUNT}`);
  console.log(`Backend Executions: ${backendExecutionCount} (Expected: 1)`);
  console.log(`Total Time: ${duration}ms (Expected: ~1000ms)`);
  
  // Check if Map was cleaned up properly
  const isMemorySafe = globalCoalescer.activeJobs.size === 0;
  console.log(`Memory safe (Map cleared)? ${isMemorySafe ? 'Yes' : 'No (Memory Leak!)'}`);
  
  // Verify all users got the exact same response object
  const allIdentical = results.every(res => res.timestamp === results[0].timestamp);
  console.log(`All clients received identical response? ${allIdentical ? 'Yes' : 'No'}`);
  
  if (backendExecutionCount === 1 && allIdentical && isMemorySafe) {
    console.log('\n✅ SUCCESS: Request Coalescing is working perfectly!');
  } else {
    console.error('\n❌ FAILURE: Coalescing failed.');
  }
}

runBenchmark().catch(console.error);
