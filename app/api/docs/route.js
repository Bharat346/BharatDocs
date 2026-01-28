// app/api/docs/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db/index.js";
import { collections, nodes } from "@/lib/db/schema";
import { eq, and, isNull, like, or } from "drizzle-orm";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const collectionName = searchParams.get("collection") || "Docs";
    const parentSlug = searchParams.get("parentSlug") || null;
    const conditions = [
      eq(nodes.isPublished, true),
      eq(collections.name, collectionName),
    ];

    if (parentSlug === null) {
      conditions.push(isNull(nodes.parentSlug));
    } else {
      conditions.push(eq(nodes.parentSlug, parentSlug));
    }

    /* ----------------------------
       SEARCH
    ----------------------------- */
    // if (search) {
    //   conditions.push(
    //     or(
    //       like(nodes.name, `%${search}%`),
    //       like(nodes.description, `%${search}%`),
    //       like(nodes.fileType, `%${search}%`)
    //     )
    //   );
    // }

    /* ----------------------------
       QUERY
    ----------------------------- */
    const result = await db
      .select({
        nodeId: nodes.id,
        collectionId: nodes.collectionId,
        parentId: nodes.parentId,
        parentSlug: nodes.parentSlug,
        name: nodes.name,
        slug: nodes.slug,
        nodeType: nodes.nodeType,
        fileType: nodes.fileType,
        filePath: nodes.filePath,
        isPublished: nodes.isPublished,
        orderIndex: nodes.orderIndex,
        updatedAt: nodes.updatedAt,

        collectionName: collections.name,
      })
      .from(nodes)
      .innerJoin(collections, eq(collections.id, nodes.collectionId))
      .where(and(...conditions))
      .orderBy(nodes.orderIndex, nodes.name);

    // console.log(result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/docs:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}
