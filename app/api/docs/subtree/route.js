import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { withCacheHeaders } from "@/lib/cache/headers";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const rootSlug = searchParams.get("rootSlug");

    // If no rootSlug is provided, we fetch ALL root nodes and their descendants.
    let query;

    if (rootSlug) {
      query = sql`
        WITH RECURSIVE subtree AS (
          SELECT id, parent_id, name, slug, type, file_path, file_type, description, order_index, is_published, created_at, updated_at
          FROM docs
          WHERE slug = ${rootSlug} AND is_published = true
          UNION ALL
          SELECT d.id, d.parent_id, d.name, d.slug, d.type, d.file_path, d.file_type, d.description, d.order_index, d.is_published, d.created_at, d.updated_at
          FROM docs d
          INNER JOIN subtree s ON d.parent_id = s.id
          WHERE d.is_published = true
        )
        SELECT * FROM subtree;
      `;
    } else {
       query = sql`
        WITH RECURSIVE subtree AS (
          SELECT id, parent_id, name, slug, type, file_path, file_type, description, order_index, is_published, created_at, updated_at
          FROM docs
          WHERE parent_id IS NULL AND is_published = true
          UNION ALL
          SELECT d.id, d.parent_id, d.name, d.slug, d.type, d.file_path, d.file_type, d.description, d.order_index, d.is_published, d.created_at, d.updated_at
          FROM docs d
          INNER JOIN subtree s ON d.parent_id = s.id
          WHERE d.is_published = true
        )
        SELECT * FROM subtree;
      `;
    }

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
      description: row.description,
      orderIndex: row.order_index,
      isPublished: row.is_published,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return withCacheHeaders(NextResponse.json(formatted), "listings");
  } catch (error) {
    console.error("GET /api/docs/subtree:", error);
    return NextResponse.json(
      { error: "Failed to fetch docs subtree", code: "SUBTREE_FETCH_ERROR" },
      { status: 500 }
    );
  }
}
