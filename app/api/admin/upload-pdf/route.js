import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth-server";

export async function POST(request) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename") || "notes.pdf";
  const folder = searchParams.get("folder") || "notes";

  // Check if BLOB_READ_WRITE_TOKEN is configured
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Vercel Blob token not configured" },
      { status: 500 },
    );
  }

  // Clean up folder name
  const cleanFolder = folder.replace(/^\/+|\/+$/g, "");

  // Use arrayBuffer for better compatibility with Vercel Blob put
  const body = await request.arrayBuffer();

  const blob = await put(`${cleanFolder}/${filename}`, body, {
    access: "public",
  });

  return NextResponse.json(blob);
}
