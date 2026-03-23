// lib/rag/vector-store.js
import { db } from "@/lib/db/index";
import { documentChunks } from "@/lib/db/schema";
import { sql, eq, count } from "drizzle-orm";

/**
 * Check if a nodeId has existing chunks/embeddings.
 */
export async function checkExistingChunks(nodeId) {
  const [result] = await db
    .select({ total: count() })
    .from(documentChunks)
    .where(eq(documentChunks.nodeId, nodeId));
  return result?.total > 0;
}

/**
 * Find an existing embedding for a specific content string.
 * This helps in reusing embeddings for identical chunks.
 */
export async function getEmbeddingByContent(content) {
  const [result] = await db
    .select({ embedding: documentChunks.embedding })
    .from(documentChunks)
    .where(eq(documentChunks.content, content))
    .limit(1);
  return result?.embedding;
}
export async function saveChunks(nodeId, chunks, embeddings) {
  if (!chunks.length || chunks.length !== embeddings.length) {
    throw new Error("Invalid chunks or embeddings provided for storage");
  }

  const values = chunks.map((content, i) => ({
    nodeId,
    content,
    embedding: embeddings[i],
    metadata: JSON.stringify({ chunkIndex: i }),
  }));

  // Chunk the database inserts if there are too many (e.g., > 100)
  const batchSize = 100;
  for (let i = 0; i < values.length; i += batchSize) {
    const batch = values.slice(i, i + batchSize);
    await db.insert(documentChunks).values(batch);
  }
}

/**
 * Similarity search locally in the pgvector database.
 */
export async function similaritySearch(embedding, nodeId = null, topK = 5) {
  // We use raw SQL to handle the pgvector operators
  // <=> is cosine distance
  // 1 - distance is similarity
  const vectorStr = `[${embedding.join(",")}]`;
  
  const query = sql`
    SELECT id, content, metadata, 1 - (embedding <=> ${vectorStr}::vector) as similarity
    FROM document_chunks
    ${nodeId ? sql`WHERE node_id = ${nodeId}::uuid` : sql``}
    ORDER BY embedding <=> ${vectorStr}::vector
    LIMIT ${topK}
  `;

  // Actually with drizzle's execute(...) we get the raw results
  const response = await db.execute(query);
  return response.map(r => ({
    id: r.id,
    content: r.content,
    metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata,
    similarity: parseFloat(r.similarity),
  }));
}

/**
 * Remove all chunks for a specific document node.
 */
export async function clearChunks(nodeId) {
  await db.delete(documentChunks).where(eq(documentChunks.nodeId, nodeId));
}
