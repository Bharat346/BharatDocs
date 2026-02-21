// app/api/pdf/route.js
import { NextResponse } from "next/server";
import { redis } from "@/server/redis";
import { withSecurityHeaders } from "@/server/security-headers";

const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60; // 604800 seconds

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const file = url.searchParams.get("file");

    if (!file) {
      console.error("[PDF Proxy] Missing file parameter");
      return new NextResponse("Missing file", { status: 400 });
    }

    // Use a safer cache key generation
    // We use a prefix + base64 of the URL (shortened) to avoid Redis key length/char issues
    const safeKey = Buffer.from(file)
      .toString("base64")
      .replace(/[/+=]/g, "")
      .substring(0, 100);
    const cacheKey = `pdf:meta:${safeKey}`;

    let meta;
    try {
      meta = await redis.get(cacheKey);
      if (meta && typeof meta === "string") {
        meta = JSON.parse(meta);
      }
    } catch (redisErr) {
      console.error("[PDF Proxy] Redis error:", redisErr);
      // Fallback: don't fail the whole request if Redis is down
    }

    if (!meta) {
      meta = {
        url: file,
        contentType: "application/pdf",
      };

      try {
        await redis.set(cacheKey, JSON.stringify(meta), {
          ex: SEVEN_DAYS_IN_SECONDS,
        });
      } catch (redisErr) {
        console.error("[PDF Proxy] Redis set error:", redisErr);
      }
    }

    console.log(`[PDF Proxy] Fetching: ${meta.url}`);

    const upstreamHeaders = {};
    if (req.headers.get("range")) {
      upstreamHeaders["Range"] = req.headers.get("range");
    }

    const upstream = await fetch(meta.url, {
      headers: upstreamHeaders,
      next: { revalidate: SEVEN_DAYS_IN_SECONDS },
    });

    if (!upstream.ok && upstream.status !== 206) {
      console.error(
        `[PDF Proxy] Upstream error: ${upstream.status} ${upstream.statusText} for ${meta.url}`,
      );
      return new NextResponse(`Upstream error: ${upstream.status}`, {
        status: upstream.status,
      });
    }

    const headers = new Headers();
    headers.set("Content-Type", meta.contentType);
    headers.set("Accept-Ranges", "bytes");
    headers.set(
      "Cache-Control",
      `public, s-maxage=${SEVEN_DAYS_IN_SECONDS}, stale-while-revalidate=86400, max-age=0`,
    );

    const contentRange = upstream.headers.get("content-range");
    const contentLength = upstream.headers.get("content-length");

    if (contentRange) headers.set("Content-Range", contentRange);
    if (contentLength) headers.set("Content-Length", contentLength);

    let res = new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });

    return withSecurityHeaders(res);
  } catch (err) {
    console.error("[PDF Proxy] Global error:", err);
    return new NextResponse(err.message || "Internal Server Error", {
      status: 500,
    });
  }
}
