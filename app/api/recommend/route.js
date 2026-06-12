import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documentChunks, nodes, collections } from "@/lib/db/schema";
import { eq, sql, inArray } from "drizzle-orm";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const nodeId = searchParams.get("nodeId");

    if (!nodeId) {
      return NextResponse.json({ error: "Missing nodeId" }, { status: 400 });
    }

    // Get the embeddings for the given nodeId (pick the first chunk as representative)
    const [chunk] = await db
      .select({ embedding: documentChunks.embedding })
      .from(documentChunks)
      .where(eq(documentChunks.nodeId, nodeId))
      .limit(1);

    if (!chunk || !chunk.embedding) {
      return NextResponse.json([], { status: 200 }); // No embeddings available
    }

    // Perform vector similarity search
    const vectorStr = `[${chunk.embedding.join(",")}]`;
    const query = sql`
      SELECT c.node_id as "nodeId", 1 - (c.embedding <=> ${vectorStr}::vector) as similarity
      FROM document_chunks c
      WHERE c.node_id != ${nodeId}::uuid
      ORDER BY similarity DESC
      LIMIT 15
    `;

    const similarChunks = await db.execute(query);
    
    // Group by nodeId and get the top 5 unique nodes
    const uniqueNodeIds = [...new Set(similarChunks.map(c => c.nodeId))].slice(0, 5);

    if (uniqueNodeIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Fetch node details for recommendations
    const recommendedNodes = await db
      .select({
        id: nodes.id,
        name: nodes.name,
        slug: nodes.slug,
        nodeType: nodes.nodeType,
        fileType: nodes.fileType,
        parentName: nodes.parentName,
        parentSlug: nodes.parentSlug,
        tags: nodes.tags,
        collectionName: collections.name,
      })
      .from(nodes)
      .innerJoin(collections, eq(collections.id, nodes.collectionId))
      .where(inArray(nodes.id, uniqueNodeIds));

    return NextResponse.json(recommendedNodes);
  } catch (error) {
    console.error("Recommendations API Error:", error);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}
