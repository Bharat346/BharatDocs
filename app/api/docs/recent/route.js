import { NextResponse } from "next/server";
import { db } from "@/lib/db/index.js";
import { nodes, collections } from "@/lib/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";

export async function GET() {
  try {
    const recentNodes = await db
      .select({
        id: nodes.id,
        name: nodes.name,
        slug: nodes.slug,
        nodeType: nodes.nodeType,
        fileType: nodes.fileType,
        parentName: nodes.parentName,
        parentSlug: nodes.parentSlug,
        collectionName: collections.name,
        updatedAt: nodes.updatedAt,
      })
      .from(nodes)
      .innerJoin(collections, eq(collections.id, nodes.collectionId))
      .where(
        and(
          eq(nodes.isPublished, true),
          ne(nodes.nodeType, "folder"), // Only files
        ),
      )
      .orderBy(desc(nodes.updatedAt))
      .limit(6);

    return NextResponse.json(recentNodes);
  } catch (error) {
    console.error("Recent API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent docs" },
      { status: 500 },
    );
  }
}
