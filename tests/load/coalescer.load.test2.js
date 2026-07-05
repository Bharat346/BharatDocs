import { globalCoalescer } from '../../lib/coalescer/index.js';

async function main() {
    globalCoalescer.clear();

    let backendExecutionCount = 0;

    const mockDatabaseQuery = async () => {
        backendExecutionCount++;

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: "Highly sought after resource!",
                    timestamp: Date.now(),
                });
            }, 100);
        });
    };

    const requestOptions = {
        method: "GET",
        route: "/api/docs",
        queryParams: {
            id: "123",
        },
        tenantId: "tenant-a",
    };

    // Start with something realistic
    const REQUEST_COUNT = 10000000;
    const CHUNK_SIZE = 100000; // Safe chunk size to avoid V8 Promise.all limits

    console.time("Load Test");

    const results = [];
    for (let i = 0; i < REQUEST_COUNT; i += CHUNK_SIZE) {
        const promises = [];
        const currentChunkSize = Math.min(CHUNK_SIZE, REQUEST_COUNT - i);
        
        for (let j = 0; j < currentChunkSize; j++) {
            promises.push(globalCoalescer.execute(requestOptions, mockDatabaseQuery));
        }
        
        const chunkResults = await Promise.all(promises);
        
        // Push results safely without hitting call stack limits
        for (const res of chunkResults) {
            results.push(res);
        }
        
        // Log progress for large runs
        if ((i + currentChunkSize) % 1000000 === 0) {
            console.log(`Processed ${i + currentChunkSize} requests...`);
        }
    }

    console.timeEnd("Load Test");

    console.log("--------------------------------");

    console.log("Backend Executions:", backendExecutionCount);

    console.log("Total Results:", results.length);

    const first = results[0];

    const identical = results.every(
        (r) => r.timestamp === first.timestamp
    );

    console.log("All Responses Identical:", identical);

    console.log("Active Jobs:", globalCoalescer.activeJobs.size);

    if (backendExecutionCount !== 1)
        throw new Error("Backend executed more than once!");

    if (!identical)
        throw new Error("Responses are different!");

    if (results.length !== REQUEST_COUNT)
        throw new Error("Missing responses!");

    if (globalCoalescer.activeJobs.size !== 0)
        throw new Error("Memory cleanup failed!");

    console.log("\n✅ All tests passed.");
}

main().catch(console.error);