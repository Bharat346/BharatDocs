import { NextResponse } from "next/server";
import { getGitHubFolders } from "@/lib/github";
import { isAuthenticatedAdmin } from "@/lib/auth-server";

export async function GET() {
  try {
    if (!(await isAuthenticatedAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const folders = await getGitHubFolders();

    return NextResponse.json({ folders });
  } catch (err) {
    console.error("Failed to fetch github folders:", err);
    return NextResponse.json(
      { error: "Failed to fetch folders from GitHub" },
      { status: 500 },
    );
  }
}
