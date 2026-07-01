import { NextResponse } from "next/server";
import { getCachedPublishedBlogs, getAllBlogTags } from "@/lib/db/queries/blogs";
import { withCacheHeaders } from "@/lib/cache/headers";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag") || null;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    const [blogsList, blogTags] = await Promise.all([
      getCachedPublishedBlogs({ tagSlug: tag, limit, offset }),
      getAllBlogTags(),
    ]);

    return withCacheHeaders(
      NextResponse.json({
        blogs: blogsList,
        tags: blogTags,
        total: blogsList.length,
      }),
      "listings",
    );
  } catch (error) {
    console.error("GET /api/blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs", code: "BLOGS_FETCH_ERROR" },
      { status: 500 },
    );
  }
}
