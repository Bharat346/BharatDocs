// app/api/pdf/rag/query/route.js
import { NextResponse } from "next/server";
import { getEmbeddings } from "@/lib/rag/jina";
import { similaritySearch } from "@/lib/rag/vector-store";
import { generateCompletion } from "@/lib/rag/groq";
import { withSecurityHeaders } from "@/server/security-headers";

export async function POST(req) {
  console.log("[RAG Query] Received request");
  try {
    const { query, nodeId, topK = 5 } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    console.log(`[RAG Query] Embedding query: "${query.substring(0, 50)}..."`);

    // 1. Embed Query
    // task: "retrieval.query" is optimized for query-side of asymmetric retrieval
    const queryEmbeddings = await getEmbeddings(query, "retrieval.query");
    const queryEmbedding = queryEmbeddings[0];

    // 2. Search Similar Chunks
    console.log(`[RAG Query] Searching vector store...`);
    const searchResults = await similaritySearch(queryEmbedding, nodeId, topK);

    if (!searchResults || searchResults.length === 0) {
      console.log(`[RAG Query] No relevant chunks found.`);
      return withSecurityHeaders(
        NextResponse.json({
          answer:
            "I couldn't find any relevant sections in the document to answer your question. Make sure the document was indexed correctly.",
          searchResults: [],
        }),
      );
    }

    // 3. Format Context for LLM
    const contextText = searchResults
      .map(
        (r, i) =>
          `[Chunk ${i + 1}] (Similarity: ${r.similarity.toFixed(3)})\n${r.content}`,
      )
      .join("\n\n---\n\n");

    const messages = [
      {
        role: "system",
        content: `You are a helpful assistant expert in analyzing documents. Use the provided context from a PDF document to answer the user's question accurately. 
        
RULES:
1. Use ONLY the provided context.
2. If the answer is not in the context, say: "I'm sorry, but I couldn't find information about this in the provided document sections."
3. Keep the answer professional and factual.
4. Structure your response using rich MDX/Markdown (headers, bold text, lists, code blocks, or tables where appropriate).
5. If the user asks for a summary, use bullet points.
6. Mention if the information seems incomplete or vague in the context.

DOCUMENT CONTEXT:
${contextText}`,
      },
      {
        role: "user",
        content: query,
      },
    ];

    // 4. Generate Response from Groq
    console.log(`[RAG Query] Generating answer with Groq...`);
    const answer = await generateCompletion(messages, {
      model: "llama-3.3-70b-versatile", // Powerful yet fast
      temperature: 0.2, // Lower temperature for more factual responses
    });

    console.log(`[RAG Query] Success! Returning answer.`);

    return withSecurityHeaders(
      NextResponse.json({
        answer,
        searchResults: searchResults.map((r) => ({
          id: r.id,
          similarity: r.similarity,
          content: r.content,
        })),
      }),
    );
  } catch (error) {
    console.error("[RAG Query Error]", error);
    return withSecurityHeaders(
      NextResponse.json({ error: error.message }, { status: 500 }),
    );
  }
}
