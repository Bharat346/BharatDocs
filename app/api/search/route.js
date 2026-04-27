import { NextResponse } from "next/server";
import { getSearchIndex } from "@/lib/search/index-builder";
import { db } from "@/lib/db";
import { nodes, collections } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    // 1. Handle Empty Query (Recent Results)
    if (!query || !query.trim()) {
      const recent = await db
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
        .where(eq(nodes.isPublished, true))
        .orderBy(sql`${nodes.updatedAt} DESC`)
        .limit(10);
      return NextResponse.json(recent);
    }

    // 2. Fuzzy Search using Fuse.js
    const fuse = await getSearchIndex();
    const results = fuse.search(query, { limit: 20 });
    
    // Map results back to the expected node format
    const formattedResults = results.map(result => result.item);

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
