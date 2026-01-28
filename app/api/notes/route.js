import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { collections, nodes } from "@/lib/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const childNodes = alias(nodes, "child_nodes");

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const collectionName = searchParams.get("collection") ?? "Notes";
    const parentSlugRaw = searchParams.get("parentSlug");

    const parentSlug =
      !parentSlugRaw || parentSlugRaw === "null"
        ? null
        : parentSlugRaw;

    const result = await db
      .select({
        nodeId: nodes.id,
        parentId: nodes.parentId,
        parentSlug: nodes.parentSlug,
        name: nodes.name,
        slug: nodes.slug,
        nodeType: nodes.nodeType,
        fileType: nodes.fileType,
        filePath: nodes.filePath,
        isPublished: nodes.isPublished,
        updatedAt: nodes.updatedAt,

        /*isolated count */
        subFolderCount: sql`
          COUNT(DISTINCT ${childNodes.id})
        `.as("subFolderCount"),
      })
      .from(nodes)
      .innerJoin(
        collections,
        eq(collections.id, nodes.collectionId)
      )
      .leftJoin(
        childNodes,
        and(
          eq(childNodes.parentId, nodes.id),
          eq(childNodes.collectionId, nodes.collectionId), // 🔒 SAME COLLECTION
          eq(childNodes.nodeType, "folder"),               // 🔒 ONLY FOLDERS
          eq(childNodes.isPublished, true)
        )
      )
      .where(
        and(
          eq(nodes.isPublished, true),
          eq(collections.name, collectionName),
          parentSlug
            ? eq(nodes.parentSlug, parentSlug)
            : isNull(nodes.parentSlug)
        )
      )
      .groupBy(nodes.id)
      .orderBy(nodes.name);

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/notes:", err);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}
