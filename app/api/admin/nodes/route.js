import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { nodes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const  data  = await db
      .select({
        id : nodes.id,
        collectionId : nodes.collectionId,
        name : nodes.name,
        slug : nodes.slug,
        nodeType : nodes.nodeType,
        filePath : nodes.filePath,
        orderIndex : nodes.orderIndex,
      })
      .from(nodes)
      .where(eq(nodes.isPublished, true))
      .where(eq(nodes.nodeType, "folder"));
      
      
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
    const body = await req.json();

    const {
      collectionId,
      parentId,
      name,
      slug,
      nodeType,
      filePath,
      fileType,
      orderIndex,
      isPublished,
    } = body;

    if (!collectionId || !name || !nodeType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const [node] = await db
      .insert(nodes)
      .values({
        collectionId,
        parentId,
        parentName: body.parentName ?? null,
        name,
        slug,
        nodeType,
        filePath,
        fileType,
        orderIndex,
        isPublished,
      })
      .returning();

    return NextResponse.json(node);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create node" },
      { status: 500 },
    );
  }
}
