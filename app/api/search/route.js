import { NextResponse } from "next/server";
import { db } from "@/lib/db/index.js";
import { nodes, collections } from "@/lib/db/schema";
import { eq, ilike, or, and , sql } from "drizzle-orm";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    // If no query, return 10 most recent nodes as "Featured" or "Initial" results
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

    // Fuzzy-like search using ilike (case-insensitive) on name, slug, and parentName
    const results = await db
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
      .where(
        and(
          eq(nodes.isPublished, true),
          or(
            ilike(nodes.name, `%${query}%`),
            ilike(nodes.slug, `%${query}%`),
            ilike(nodes.parentName || "", `%${query}%`),
            sql`${nodes.tags}::text ilike ${`%${query}%`}`,
          ),
        ),
      )
      .limit(20);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
