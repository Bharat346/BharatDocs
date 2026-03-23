// app/api/pdf/rag/ingest/route.js
import { NextResponse } from "next/server";
import { extractTextFromPDF, chunkText } from "@/lib/rag/utils";
import { getEmbeddings } from "@/lib/rag/jina";
import { saveChunks, clearChunks, checkExistingChunks, getEmbeddingByContent } from "@/lib/rag/vector-store";
import { withSecurityHeaders } from "@/server/security-headers";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { nodeId, fileUrl } = await req.json();
    if (!nodeId || !fileUrl) {
      return NextResponse.json({ error: "Missing nodeId or fileUrl" }, { status: 400 });
    }

    // 0. Check if this document is already indexed
    const alreadyExists = await checkExistingChunks(nodeId);
    if (alreadyExists) {
      console.log(`[RAG Ingest] Skipping: nodeId ${nodeId} already fully indexed.`);
      return withSecurityHeaders(NextResponse.json({ 
        success: true, 
        message: "PDF was already indexed. Retrieval is ready.",
        cached: true 
      }));
    }

    console.log(`[RAG Ingest] Fetching PDF from: ${fileUrl}`);

    // 1. Fetch the PDF file
    const response = await fetch(fileUrl);
    if (!response.ok) {
      console.error(`[RAG Ingest] Failed to fetch PDF: ${response.status}`);
      throw new Error(`Could not fetch the PDF document: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Extract Text
    console.log(`[RAG Ingest] Extracting text...`);
    const fullText = await extractTextFromPDF(buffer);

    // 3. Chunk Text
    console.log(`[RAG Ingest] Chunking text...`);
    // Aim for 300-500 tokens (approx 1200-2000 characters)
    const chunks = chunkText(fullText, 1500, 200);
    if (!chunks.length) {
      return NextResponse.json({ message: "No text found in PDF to index." });
    }

    // 4. Clear existing chunks for this nodeId
    await clearChunks(nodeId);

    // 5. Get Embeddings (Check cache first)
    console.log(`[RAG Ingest] Getting embeddings for ${chunks.length} chunks...`);
    
    // Check which chunks already have embeddings in the database
    const finalEmbeddings = await Promise.all(
      chunks.map(async (content) => {
        // Here we attempt to find the same content string anywhere in our DB
        // If it exists, we reuse its vector to save a Jina API call.
        const cached = await getEmbeddingByContent(content);
        return { content, embedding: cached };
      })
    );

    const chunksToRequest = finalEmbeddings
      .filter(f => !f.embedding)
      .map(f => f.content);

    if (chunksToRequest.length > 0) {
      console.log(`[RAG Ingest] Requesting ${chunksToRequest.length} new embeddings from Jina...`);
      const newVectors = await getEmbeddings(chunksToRequest);
      
      let newVectorIndex = 0;
      for (const item of finalEmbeddings) {
        if (!item.embedding) {
          item.embedding = newVectors[newVectorIndex++];
        }
      }
    } else {
      console.log(`[RAG Ingest] All chunks were found in cache. No API request needed.`);
    }

    // 6. Save to DB
    console.log(`[RAG Ingest] Saving to vector store...`);
    const allVectors = finalEmbeddings.map(f => f.embedding);
    await saveChunks(nodeId, chunks, allVectors);

    console.log(`[RAG Ingest] Success: ${chunks.length} chunks stored.`);

    return withSecurityHeaders(NextResponse.json({ 
      success: true, 
      chunkCount: chunks.length, 
      message: "PDF ingested successfully into vector store." 
    }));

  } catch (error) {
    console.error("[RAG Ingest Error]", error);
    return withSecurityHeaders(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}
