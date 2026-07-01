import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { withCacheHeaders } from "@/lib/cache/headers";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const rootSlug = searchParams.get("rootSlug");

    if (!rootSlug) {
      return NextResponse.json({ error: "rootSlug is required" }, { status: 400 });
    }

    // Use recursive CTE to fetch the root folder and all its descendants
    const query = sql`
      WITH RECURSIVE subtree AS (
        SELECT id, parent_id, name, slug, type, file_path, file_type, file_size, description, order_index, is_published, created_at, updated_at
        FROM notes
        WHERE slug = ${rootSlug} AND is_published = true
        UNION ALL
        SELECT n.id, n.parent_id, n.name, n.slug, n.type, n.file_path, n.file_type, n.file_size, n.description, n.order_index, n.is_published, n.created_at, n.updated_at
        FROM notes n
        INNER JOIN subtree s ON n.parent_id = s.id
        WHERE n.is_published = true
      )
      SELECT * FROM subtree;
    `;

    const rawResult = await db.execute(query);
    
    // Map database snake_case fields to camelCase
    const formatted = rawResult.map(row => ({
      id: row.id,
      parentId: row.parent_id,
      name: row.name,
      slug: row.slug,
      type: row.type,
      filePath: row.file_path,
      fileType: row.file_type,
      fileSize: row.file_size,
      description: row.description,
      orderIndex: row.order_index,
      isPublished: row.is_published,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return withCacheHeaders(NextResponse.json(formatted), "listings");
  } catch (error) {
    console.error("GET /api/notes/subtree:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes subtree", code: "SUBTREE_FETCH_ERROR" },
      { status: 500 }
    );
  }
}
