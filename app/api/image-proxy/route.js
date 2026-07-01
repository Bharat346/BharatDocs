import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return new NextResponse("Missing url", { status: 400 });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      return new NextResponse("Invalid url", { status: 400 });
    }

    // Basic SSRF Protection: Block private IPs and localhost
    const hostname = parsedUrl.hostname.toLowerCase();
    const isLocalOrPrivate = 
      hostname === "localhost" ||
      hostname.startsWith("127.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("169.254.") ||
      hostname.includes("::1");

    if (isLocalOrPrivate) {
      return new NextResponse("Invalid external URL", { status: 403 });
    }

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    };

    if (url.includes("raw.githubusercontent.com") && process.env.github_AT) {
      headers["Authorization"] = `token ${process.env.github_AT}`;
    }

    // Fetch the image pretending to be a normal browser to bypass hotlinking protection
    const response = await fetch(url, { headers });

    if (!response.ok) {
      return new NextResponse("Failed to fetch image", { status: response.status });
    }

    // Pass the image stream and content type back to the client
    const contentType = response.headers.get("content-type");
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
