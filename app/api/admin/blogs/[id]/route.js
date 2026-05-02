import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth-server";
import { updateBlog, deleteBlog } from "@/lib/db/blog-queries";

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
