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
        content: `You are a specialized document analysis AI. Your ONLY task is to answer questions based STRICTLY on the provided DOCUMENT CONTEXT.

STRICT OPERATING RULES:
1. INTERNAL KNOWLEDGE FORBIDDEN: Do NOT use any information from your general training data that is not explicitly present in the provided context.
2. SOURCE LIMITATION: Your answers must be derived 100% from the DOCUMENT CONTEXT below. 
3. UNKNOWN INFORMATION: If the answer is not clearly stated in the context, your ONLY response should be: "I'm sorry, I cannot find information regarding this in the provided document."
4. RELEVANCE CHECK: If the user's query is not directly related to the document (e.g., asking for general advice, code generation, creative writing, or personal opinions), decline to answer and state that you can only assist with document-specific queries.
5. NO OUTSIDE CONTEXT: Do not add any "extra" information, explanations, or context that isn't in the PDF.
6. MDX/MARKDOWN: Format your response using clean Markdown (headers, lists, tables) only if the data exists in the context.

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
