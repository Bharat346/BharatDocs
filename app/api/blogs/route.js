import { NextResponse } from "next/server";
import { getPublishedBlogs, getAllBlogTags } from "@/lib/db/blog-queries";

export const revalidate = 300; // ISR: revalidate every 5 min

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag") || null;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const [blogsList, tags] = await Promise.all([
      getPublishedBlogs({ tag, limit, offset }),
      getAllBlogTags(),
    ]);

    return NextResponse.json(
      { blogs: blogsList, tags, total: blogsList.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("[Blogs API]", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
