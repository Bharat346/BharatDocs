// app/api/docs/route.js
import { NextResponse } from "next/server";
import { getDocsByParentSlug } from "@/lib/db/queries";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const collectionName = searchParams.get("collection") || "Docs";
    const parentSlug = searchParams.get("parentSlug") || null;
    const tag = searchParams.get("tag");

    const result = await getDocsByParentSlug(collectionName, parentSlug, tag);

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/docs:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}
