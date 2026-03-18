import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { isAuthenticatedAdmin } from "@/lib/auth-server";

export async function GET() {
  try {
    if (!(await isAuthenticatedAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // List all blobs to find directory-like prefixes
    const { blobs } = await list();

    // Extract unique "folders" by finding all slash-delimited prefixes
    const folderSet = new Set();

    blobs.forEach((blob) => {
      // blob.pathname is usually the clean path like "Btech/CSE/notes.pdf"
      const parts = blob.pathname.split("/");
      // If there's at least one slash, the parts before the last part are folders
      if (parts.length > 1) {
        // Build cumulative paths e.g. ["Btech", "Btech/CSE"]
        let currentPath = "";
        for (let i = 0; i < parts.length - 1; i++) {
          currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
          folderSet.add(currentPath);
        }
      }
    });

    return NextResponse.json({ folders: Array.from(folderSet) });
  } catch (err) {
    console.error("Failed to list blob folders:", err);
    return NextResponse.json(
      { error: "Failed to fetch folders from Vercel Blob" },
      { status: 500 },
    );
  }
}
