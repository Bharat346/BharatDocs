// app/api/pdf/route.ts
import { NextResponse } from "next/server";
import { redis } from "@/server/redis";

export async function GET(req) {
  const url = new URL(req.url);
  const file = url.searchParams.get("file");

  if (!file) {
    return new NextResponse("Missing file", { status: 400 });
  }

  const cacheKey = `pdf:meta:${file}`;

  // 1️⃣ Check metadata cache
  let meta = await redis.get(cacheKey);

  if (!meta) {
    const pdfUrl = file; // Could be an external URL or S3/Vercel Storage

    meta = {
      url: pdfUrl,
      contentType: "application/pdf",
    };

    // Cache metadata (not actual file) for 1 hour
    await redis.set(cacheKey, JSON.stringify(meta), { ex: 60 * 60 });
  } else {
    meta = JSON.parse(meta);
  }

  // 2️⃣ Proxy the request with Range headers for streaming
  const upstream = await fetch(meta.url, {
    headers: {
      Range: req.headers.get("range") ?? "",
    },
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": meta.contentType,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
