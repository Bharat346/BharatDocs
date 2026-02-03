// app/api/pdf/route.js
import { NextResponse } from "next/server";
import { redis } from "@/server/redis";
import { withSecurityHeaders } from "@/server/security-headers";

export async function GET(req) {
  const url = new URL(req.url);
  const file = url.searchParams.get("file");

  if (!file) {
    return new NextResponse("Missing file", { status: 400 });
  }

  const cacheKey = `pdf:meta:${file}`;

  let meta = await redis.get(cacheKey);

  // 🔑 FIX: parse only if needed
  if (!meta) {
    meta = {
      url: file,
      contentType: "application/pdf",
    };

    await redis.set(cacheKey, JSON.stringify(meta), { ex: 60 * 60 });
  } else if (typeof meta === "string") {
    meta = JSON.parse(meta);
  }
  // else: meta is already an object → leave it

  const upstream = await fetch(meta.url, {
    headers: {
      Range: req.headers.get("range") ?? undefined,
    },
  });

  const headers = new Headers();
  headers.set("Content-Type", meta.contentType);
  headers.set("Accept-Ranges", "bytes");

  const contentRange = upstream.headers.get("content-range");
  const contentLength = upstream.headers.get("content-length")

  if (contentRange) {
    headers.set("Content-Range", contentRange);
  }
  if(contentLength){
    headers.set("Content-Length", contentLength);
  }

  let res =  new NextResponse(upstream.body, {
    status: upstream.status,
    headers
  });

  // res.headers.set("Cross-Origin-Embedder-Policy", "unsafe-none");
  // res.headers.set("Cross-Origin-Resource-Policy", "cross-origin");

  return withSecurityHeaders(res);
}
