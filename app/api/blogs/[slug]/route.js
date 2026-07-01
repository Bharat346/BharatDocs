import { NextResponse } from "next/server";
import { getCachedBlogBySlug, getBlogTags } from "@/lib/db/queries/blogs";
import { withCacheHeaders } from "@/lib/cache/headers";

export async function GET(req, { params }) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Missing slug parameter", code: "MISSING_SLUG" },
        { status: 400 },
      );
    }

    const blog = await getCachedBlogBySlug(slug);

    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Enrich with tags
    const blogTagsList = await getBlogTags(blog.id);

    return withCacheHeaders(
      NextResponse.json({ ...blog, tags: blogTagsList }),
      "detail",
    );
  } catch (error) {
    console.error("GET /api/blogs/[slug]:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog", code: "BLOG_FETCH_ERROR" },
      { status: 500 },
    );
  }
}
