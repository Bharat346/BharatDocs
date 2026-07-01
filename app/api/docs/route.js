import { NextResponse } from "next/server";
import { getCachedDocsByParentSlug } from "@/lib/db/queries/docs";
import { withCacheHeaders } from "@/lib/cache/headers";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const parentSlug = searchParams.get("parentSlug") || null;
    const tag = searchParams.get("tag") || null;

    const result = await getCachedDocsByParentSlug(
      parentSlug === "null" ? null : parentSlug,
      tag,
    );

    return withCacheHeaders(NextResponse.json(result), "listings");
  } catch (error) {
    console.error("GET /api/docs:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents", code: "DOCS_FETCH_ERROR" },
      { status: 500 },
    );
  }
}
