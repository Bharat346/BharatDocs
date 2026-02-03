import { NextResponse } from "next/server";
import { withSecurityHeaders } from "@/server/security-headers";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return withSecurityHeaders(
      NextResponse.json({ error: "URL is required" }, { status: 400 }),
    );
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return withSecurityHeaders(
        NextResponse.json(
          { error: "Failed to fetch image" },
          { status: response.status },
        )
      );
    }

    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    
    return withSecurityHeaders(
      new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": res.headers.get("Content-Type") || "image/jpeg",
          "Cross-Origin-Resource-Policy" : "same-origin",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      }),
    );
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
