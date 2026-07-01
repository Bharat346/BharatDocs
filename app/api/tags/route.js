import { NextResponse } from "next/server";
import { getCachedAllTags } from "@/lib/db/queries/tags";
import { withCacheHeaders } from "@/lib/cache/headers";

export async function GET() {
  try {
    const result = await getCachedAllTags();

    return withCacheHeaders(NextResponse.json(result), "tags");
  } catch (error) {
    console.error("GET /api/tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags", code: "TAGS_FETCH_ERROR" },
      { status: 500 },
    );
  }
}
