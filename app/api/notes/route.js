import { NextResponse } from "next/server";
import { getCachedNotesByParentSlug } from "@/lib/db/queries/notes";
import { withCacheHeaders } from "@/lib/cache/headers";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const parentSlug = searchParams.get("parentSlug") || null;
    const tag = searchParams.get("tag") || null;

    const result = await getCachedNotesByParentSlug(
      parentSlug === "null" ? null : parentSlug,
      tag,
    );

    return withCacheHeaders(NextResponse.json(result), "listings");
  } catch (error) {
    console.error("GET /api/notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes", code: "NOTES_FETCH_ERROR" },
      { status: 500 },
    );
  }
}
