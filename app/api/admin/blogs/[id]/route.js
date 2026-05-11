import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth-server";
import { updateBlog, deleteBlog } from "@/lib/db/blog-queries";
import { db } from "@/lib/db/index";
import { globalNotifications } from "@/lib/db/schema";

/* ── PUT: Update blog ── */
export async function PUT(request, { params }) {
  try {
    if (!(await isAuthenticatedAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const blog = await updateBlog(id, body);

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Trigger notification if it's being published
    if (body.isPublished) {
      // We can optionally check if it was ALREADY published to avoid duplicate notifications,
      // but for now, any update while published can notify or we can just trust the user.
      await db.insert(globalNotifications).values({
        title: `Updated Blog: ${blog.title}`,
        message: blog.description,
        type: 'blogs',
        tags: blog.tags || [],
        url: `/blogs/${blog.slug}`
      });
    }

    return NextResponse.json({ success: true, blog });
  } catch (error) {
    console.error("[Admin Blog PUT]", error);
    return NextResponse.json(
      { error: "Failed to update blog", details: error.message },
      { status: 500 }
    );
  }
}

/* ── DELETE: Remove blog ── */
export async function DELETE(request, { params }) {
  try {
    if (!(await isAuthenticatedAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteBlog(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Blog DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete blog", details: error.message },
      { status: 500 }
    );
  }
}
