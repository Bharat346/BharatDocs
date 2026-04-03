import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { nodes } from "@/lib/db/schema";
import { eq, and, or, isNull } from "drizzle-orm";
import { isAuthenticatedAdmin } from "@/lib/auth-server";

export async function GET() {
  try {
    if (!(await isAuthenticatedAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await db
      .select({
        id: nodes.id,
        collectionId: nodes.collectionId,
        name: nodes.name,
        slug: nodes.slug,
        nodeType: nodes.nodeType,
        filePath: nodes.filePath,
        fileSize: nodes.fileSize,
        parentName: nodes.parentName,
        parentSlug: nodes.parentSlug,
        orderIndex: nodes.orderIndex,
        isPublished: nodes.isPublished,
      })
      .from(nodes)
      .where(eq(nodes.isPublished, true))
      .where(eq(nodes.nodeType, "folder"))
      .orderBy(nodes.orderIndex);

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch nodes" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    if (!(await isAuthenticatedAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();

    const {
      collectionId,
      parentId,
      name,
      slug,
      nodeType,
      filePath,
      fileType,
      fileSize,
      parentName,
      parentSlug,
      orderIndex,
      isPublished = false,
      tags = [],
    } = body;

    if (!collectionId || !name || !nodeType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check for duplicate name/slug in the same location
    const existingNode = await db
      .select({ id: nodes.id })
      .from(nodes)
      .where(
        and(
          eq(nodes.collectionId, collectionId),
          eq(nodes.parentId, parentId || null),
          or(eq(nodes.name, name), eq(nodes.slug, slug || "")),
        ),
      )
      .limit(1);

    if (existingNode.length > 0) {
      return NextResponse.json(
        {
          error:
            "A node with this name or slug already exists in this location",
        },
        { status: 409 },
      );
    }

    // Calculate orderIndex if not provided
    let finalOrderIndex = orderIndex;
    if (typeof orderIndex !== "number") {
      const result = await db
        .select({ maxOrder: db.$max(nodes.orderIndex) })
        .from(nodes)
        .where(
          and(
            eq(nodes.collectionId, collectionId),
            eq(nodes.parentId, parentId || null),
          ),
        );

      finalOrderIndex = (result[0]?.maxOrder || 0) + 1;
    }

    const [node] = await db
      .insert(nodes)
      .values({
        collectionId,
        parentId: parentId || null,
        name,
        slug: slug || null,
        nodeType,
        filePath: filePath || null,
        fileType: fileType || null,
        fileSize: fileSize || null,
        parentName: parentName || null,
        parentSlug: parentSlug || null,
        orderIndex: finalOrderIndex,
        isPublished: Boolean(isPublished),
        tags: Array.isArray(tags) ? tags : [],
      })
      .returning({
        id: nodes.id,
        collectionId: nodes.collectionId,
        parentId: nodes.parentId,
        name: nodes.name,
        slug: nodes.slug,
        nodeType: nodes.nodeType,
        filePath: nodes.filePath,
        fileType: nodes.fileType,
        fileSize: nodes.fileSize,
        parentName: nodes.parentName,
        parentSlug: nodes.parentSlug,
        orderIndex: nodes.orderIndex,
        isPublished: nodes.isPublished,
      });

    return NextResponse.json(node);
  } catch (err) {
    console.error(err);
    if (err.code === "23503") {
      return NextResponse.json(
        { error: "Referenced collection or parent does not exist" },
        { status: 400 },
      );
    }

    if (err.code === "23505") {
      return NextResponse.json(
        { error: "A node with this name or slug already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create node" },
      { status: 500 },
    );
  }
}
