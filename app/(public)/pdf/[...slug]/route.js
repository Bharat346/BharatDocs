import { NextResponse } from "next/server";
import { getCachedAllDocs } from "@/lib/db/queries/docs";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    
    // 1. Resolve node by path
    const allDocs = await getCachedAllDocs();
    let currentParentId = null;
    let currentNode = null;

    for (const segment of slug) {
      currentNode = allDocs.find(
        d => d.slug === segment && (d.parentId === currentParentId || (!d.parentId && !currentParentId))
      );
      if (!currentNode) return new NextResponse("Not Found", { status: 404 });
      currentParentId = currentNode.id;
    }

    if (!currentNode || currentNode.fileType !== "pdf") {
      return new NextResponse("Not a valid PDF document", { status: 400 });
    }

    if (!currentNode.filePath) {
      return new NextResponse("Document path missing", { status: 404 });
    }

    // 2. Fetch from GitHub Storage
    const githubToken = process.env.github_AT;
    if (!githubToken) {
      return new NextResponse("Storage configuration error", { status: 500 });
    }

    // Use .raw to get the binary file directly instead of base64 JSON
    const response = await fetch(currentNode.filePath, {
      headers: {
        Accept: "application/vnd.github.v3.raw",
        Authorization: `token ${githubToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return new NextResponse("Failed to retrieve file from storage", { status: response.status });
    }

    // 3. Stream the response directly to the client as PDF
    const arrayBuffer = await response.arrayBuffer();
    
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${currentNode.name}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[PDF Proxy Error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
