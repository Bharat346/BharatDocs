import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { nodes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const result = await db
      .select({
        nodeId: nodes.id,
        name: nodes.name,
        slug: nodes.slug,
        nodeType: nodes.nodeType,
        fileType: nodes.fileType,
        filePath: nodes.filePath,
        isPublished: nodes.isPublished,
      })
      .from(nodes)
      .where(
        and(
          eq(nodes.slug, slug),
          eq(nodes.isPublished, true)
        )
      )
      .limit(1);

    if (!result.length) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (err) {
    console.error("GET /api/notes/node/[slug]:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
