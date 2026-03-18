import { NextResponse } from "next/server";
import { saveToGitHub } from "@/lib/github";
import { isAuthenticatedAdmin } from "@/lib/auth-server";

export async function POST(request) {
  try {
    if (!(await isAuthenticatedAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, path } = await request.json();

    if (!content || !path) {
      return NextResponse.json(
        { error: "Content and path are required" },
        { status: 400 },
      );
    }

    const result = await saveToGitHub(content, path);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("GitHub Save Error:", error);
    return NextResponse.json(
      { error: "Failed to save to GitHub", details: error.message },
      { status: 500 },
    );
  }
}
