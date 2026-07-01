import { NextResponse } from "next/server";
import { getCachedRecentDocs, getCachedAllDocs } from "@/lib/db/queries/docs";
import { withCacheHeaders } from "@/lib/cache/headers";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "6", 10), 20);

    const result = await getCachedRecentDocs(limit);
    const allDocs = await getCachedAllDocs();

    const resolvedResult = result.map((doc) => {
      let current = allDocs.find((d) => d.id === doc.id);
      let path = [];
      while (current) {
        path.unshift(current.slug);
        current = allDocs.find((d) => d.id === current.parentId);
      }
      return { ...doc, fullSlug: path.join("/") };
    });

    return withCacheHeaders(NextResponse.json(resolvedResult), "listings");
  } catch (error) {
    console.error("GET /api/docs/recent:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent docs", code: "DOCS_RECENT_ERROR" },
      { status: 500 },
    );
  }
}
