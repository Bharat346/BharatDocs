/**
 * Grover's Algorithm Simulation (Classical)
 * -----------------------------------------
 * This is a classical simulation of the quantum Grover search algorithm.
 * Grover's algorithm provides a quadratic speedup for searching unstructured data.
 * 
 * Complexity: O(√N) where N = 2^n qubits.
 */

class GroverSimulation {
    constructor(numQubits) {
        this.n = numQubits;
        this.N = Math.pow(2, numQubits);
        // Initialize state vector in uniform superposition
        // Each amplitude is 1/sqrt(N)
        const initialAmplitude = 1 / Math.sqrt(this.N);
        this.stateVector = new Array(this.N).fill(initialAmplitude);
    }

    /**
     * The Oracle: Flips the sign of the amplitude of the target state.
     * In a real quantum computer, this is implemented as a black-box circuit.
     */
    applyOracle(targetIndex) {
        if (targetIndex >= 0 && targetIndex < this.N) {
            this.stateVector[targetIndex] *= -1;
        }
    }

    /**
     * The Diffusion Operator (Grover's Diffusion Operator):
     * Reflects the amplitudes about the mean amplitude.
     * Formula: A_i = 2 * mean - A_i
     */
    applyDiffusion() {
        const mean = this.stateVector.reduce((a, b) => a + b, 0) / this.N;
        for (let i = 0; i < this.N; i++) {
            this.stateVector[i] = 2 * mean - this.stateVector[i];
        }
    }

    /**
     * Executes the search for a target index.
     * Optimal number of iterations is roughly (π/4) * √N.
     */
    search(targetIndex) {
        const iterations = Math.floor((Math.PI / 4) * Math.sqrt(this.N));
        
        console.log(`--- Starting Grover Simulation ---`);
        console.log(`Qubits: ${this.n} | Search Space (N): ${this.N}`);
        console.log(`Target Index: ${targetIndex}`);
        console.log(`Optimal Iterations: ${iterations}\n`);

        for (let i = 1; i <= iterations; i++) {
            this.applyOracle(targetIndex);
            this.applyDiffusion();
            
            // Log progress for the target amplitude
            const prob = Math.pow(this.stateVector[targetIndex], 2) * 100;
            console.log(`Iteration ${i}: Probability of finding target = ${prob.toFixed(2)}%`);
        }

        return this.getResult();
    }

    getResult() {
        // Map state vector to probabilities
        return this.stateVector.map((amplitude, index) => ({
            index,
            probability: Math.pow(amplitude, 2)
        }));
    }
}

// --- Mock Data Generation ---

/**
 * Generates a large dataset of documents for searching.
 * @param {number} size - Number of elements to generate.
 */
function generateMockData(size) {
    const titles = [
        "Quantum Computing Basics", "Advanced JavaScript Patterns", "Machine Learning in Production",
        "The Future of Web Development", "Understanding Grover's Algorithm", "Neural Networks Decoded",
        "React Server Components", "Database Indexing Strategies", "Rust for Systems Programming",
        "Zero Trust Security", "Microservices Architecture", "Serverless Functions 101"
    ];
    
    return Array.from({ length: size }, (_, i) => ({
        id: `BH-${1000 + i}`,
        title: `${titles[i % titles.length]} - Part ${Math.floor(i / titles.length)}`,
        author: `Author_${(i % 5) + 1}`,
        timestamp: new Date(Date.now() - i * 3600000).toISOString()
    }));
}

// Configuration
const DATA_SIZE = 1024; // 2^10
const NUM_QUBITS = Math.ceil(Math.log2(DATA_SIZE));
const MOCK_DATA = generateMockData(DATA_SIZE);

// The element we are looking for (Search Query)
const SEARCH_TARGET_TITLE = "Advanced JavaScript Patterns - Part 61"; 
const TARGET_INDEX = MOCK_DATA.findIndex(item => item.title === SEARCH_TARGET_TITLE);

if (TARGET_INDEX === -1) {
    console.error("Error: Target element not found in the dataset.");
    process.exit(1);
}

// --- Execution ---

console.log(`\n🚀 Initializing Quantum Search Simulation on BharatDocs...`);
console.log(`📦 Dataset Size: ${DATA_SIZE} documents`);
console.log(`🔍 Searching for: "${SEARCH_TARGET_TITLE}"`);

const grover = new GroverSimulation(NUM_QUBITS);
const results = grover.search(TARGET_INDEX);

// Find the result with highest probability
const found = results.reduce((prev, current) => 
    (prev.probability > current.probability) ? prev : current
);

const foundDocument = MOCK_DATA[found.index];

console.log(`\n--- SEARCH RESULT ---`);
console.log(`✅ Status: ${found.index === TARGET_INDEX ? "MATCH FOUND" : "SEARCH FAILED"}`);
console.log(`🆔 Document ID: ${foundDocument.id}`);
console.log(`📝 Title: ${foundDocument.title}`);
console.log(`👤 Author: ${foundDocument.author}`);
console.log(`📅 Created: ${foundDocument.timestamp}`);
console.log(`🎯 Index: ${found.index}`);
console.log(`📈 Confidence: ${(found.probability * 100).toFixed(4)}%`);

if (found.index === TARGET_INDEX) {
    console.log("\n✨ SUCCESS: The element was successfully located in the unstructured dataset using quadratic speedup simulation.");
} else {
    console.log("\n❌ FAILURE: The algorithm failed to converge on the correct target.");
}
