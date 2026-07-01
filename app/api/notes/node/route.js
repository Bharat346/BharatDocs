import { NextResponse } from "next/server";
import { getNoteBySlug } from "@/lib/db/queries/notes";
import { withCacheHeaders } from "@/lib/cache/headers";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Missing slug parameter", code: "MISSING_SLUG" },
        { status: 400 },
      );
    }

    const note = await getNoteBySlug(slug);

    if (!note) {
      return NextResponse.json(
        { error: "Note not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    return withCacheHeaders(NextResponse.json(note), "listings");
  } catch (error) {
    console.error("GET /api/notes/node:", error);
    return NextResponse.json(
      { error: "Failed to fetch note", code: "NOTE_FETCH_ERROR" },
      { status: 500 },
    );
  }
}
