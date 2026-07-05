import autocannon from 'autocannon';

/**
 * This script runs a load test against your local running server.
 * Make sure your Next.js server is running (npm run dev or npm run start) on port 3000 before running this.
 */
async function runLoadTest() {
  console.log("🚀 Starting Load Test...");
  console.log("Ensure your server is running on http://localhost:3000\n");

  const url = 'http://localhost:3000/api/docs'; // Change this to whatever API route you want to test!

  const instance = autocannon({
    url: url,
    connections: 100, // Number of concurrent connections
    pipelining: 1,
    duration: 10,     // Test duration in seconds
  });

  // Track progress in the console
  autocannon.track(instance, { renderProgressBar: true });

  instance.on('done', (result) => {
    console.log("\n📊 Load Test Results:\n");
    console.log(`Total Requests Sent: ${result.requests.sent}`);
    console.log(`Successful Responses: ${result['2xx']}`);
    console.log(`Failed Responses(Errors / Timeouts): ${result.non2xx + result.timeouts}`);
    console.log(`Average Latency: ${result.latency.average} ms`);
    console.log(`Requests per second: ${result.requests.average}`);

    console.log("\n💡 Check your Next.js server terminal!");
    console.log("With Request Coalescing, you should see the database query log trigger only a few times despite thousands of requests.");
  });
}

runLoadTest();
