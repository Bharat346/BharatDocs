import { NextResponse } from "next/server";
import { db } from "@/lib/db/index.js";
import { nodes, collections } from "@/lib/db/schema";
import { eq, ilike, or, and } from "drizzle-orm";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json([]);
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
