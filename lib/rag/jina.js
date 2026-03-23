// lib/rag/jina.js
export async function getEmbeddings(text, task = "retrieval.passage") {
  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey) {
    throw new Error("JINA_API_KEY is missing from environment");
  }

  const input = Array.isArray(text) ? text : [text];
  
  const response = await fetch("https://api.jina.ai/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "jina-embeddings-v5-text-small",
      task: task,
      dimensions: 512,
      normalized: true,
      input: input,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Jina API Error] ${response.status}: ${errorBody}`);
    throw new Error(`Jina AI embedding error: ${response.status}`);
  }

  const result = await response.json();
  return result.data.map((d) => d.embedding);
}
