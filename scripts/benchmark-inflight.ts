import { inflightManager } from '../lib/inflight/manager';

async function runBenchmark() {
  console.log('Starting InFlight Manager Benchmark...');
  console.log('Simulating 10,000 concurrent identical requests...');

  // Disable distributed for local memory benchmarking,
  // or ensure Redis is running to test distributed overhead.
  process.env.DISABLE_DISTRIBUTED_INFLIGHT = 'true'; 

  const totalRequests = 10000;
  let executionCount = 0;

  const expensiveTask = async () => {
    executionCount++;
    // Simulate some async work
    return new Promise((resolve) => setTimeout(() => resolve('Hello World'), 100));
  };

  const requestOptions = {
    method: 'GET',
    url: '/api/heavy-load',
    query: { filter: 'active' },
  };

  const startTime = Date.now();

  const promises = [];
  for (let i = 0; i < totalRequests; i++) {
    promises.push(inflightManager.execute(requestOptions, expensiveTask));
  }

  const results = await Promise.all(promises);
  
  const endTime = Date.now();
  const metrics = inflightManager.getMetrics();

  console.log('--- Benchmark Results ---');
  console.log(`Total Requests: ${totalRequests}`);
  console.log(`Total Time: ${endTime - startTime}ms`);
  console.log(`Actual Executions: ${executionCount}`);
  console.log(`Peak Memory Concurrency: ${metrics.peakConcurrency}`);
  console.log(`Local Cache Hits (Deduplicated): ${metrics.localDeduplicated}`);
  console.log(`Errors: ${metrics.errors}`);
  
  if (executionCount !== 1) {
    console.error('FAILED: Execution count was not exactly 1!');
    process.exit(1);
  }

  if (results.length !== totalRequests || !results.every(r => r === 'Hello World')) {
    console.error('FAILED: Not all results were identical/correct!');
    process.exit(1);
  }

  console.log('SUCCESS: All 10,000 requests successfully coalesced into 1 execution with O(1) deduplication!');
  process.exit(0);
}

runBenchmark().catch(console.error);
