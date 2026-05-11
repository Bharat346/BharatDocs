import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth-server";
import { getAllBlogsAdmin, createBlog } from "@/lib/db/blog-queries";
import { db } from "@/lib/db/index";
import { globalNotifications } from "@/lib/db/schema";

/* ── GET: List all blogs (admin view, includes unpublished) ── */
export async function GET() {
  try {
    if (!(await isAuthenticatedAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const blogsList = await getAllBlogsAdmin();
    return NextResponse.json({ blogs: blogsList });
  } catch (error) {
    console.error("[Admin Blogs GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

/* ── POST: Create a new blog entry ── */
export async function POST(request) {
  try {
    if (!(await isAuthenticatedAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, description, coverImage, githubPath, author, tags, readTime, isPublished, isFeatured } = body;

    // Validation
    if (!title || !slug || !description || !githubPath) {
      return NextResponse.json(
        { error: "title, slug, description, and githubPath are required" },
        { status: 400 }
      );
    }

    // Sanitize slug
    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const blog = await createBlog({
      title,
      slug: cleanSlug,
      description,
      coverImage: coverImage || null,
      githubPath,
      author: author || "Bharat",
      tags: tags || [],
      readTime: readTime || 5,
      isPublished: isPublished || false,
      isFeatured: isFeatured || false,
    });

    if (isPublished) {
      console.log(`[Admin Blogs] Triggering notification for blog: ${title}`);
      await db.insert(globalNotifications).values({
        title: `New Blog: ${title}`,
        message: description,
        type: 'blogs',
        tags: tags || [],
        url: `/blogs/${cleanSlug}`
      });
    }

    return NextResponse.json({ success: true, blog }, { status: 201 });
  } catch (error) {
    console.error("[Admin Blogs POST]", error);

    // Handle unique constraint violation
    if (error.message?.includes("unique") || error.code === "23505") {
      return NextResponse.json(
        { error: "A blog with this slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create blog", details: error.message },
      { status: 500 }
    );
  }
}
