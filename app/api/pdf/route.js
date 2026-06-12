// app/api/pdf/route.js
import { NextResponse } from "next/server";
import { redis } from "@/server/redis";
import { withSecurityHeaders } from "@/server/security-headers";

const SEVEN_DAYS = 7 * 24 * 60 * 60; // 604800 seconds
const ONE_DAY = 86400;

// Simple circuit breaker to avoid spamming logs when Redis is down
let isRedisDown = false;
let lastRedisCheck = 0;
const REDIS_RETRY_DELAY = 60000; // 1 minute

async function safeRedisGet(key) {
  const now = Date.now();
  if (isRedisDown && now - lastRedisCheck < REDIS_RETRY_DELAY) return null;

  try {
    const data = await redis.get(key);
    isRedisDown = false;
    return data;
  } catch (err) {
    console.warn(`[PDF Proxy] Redis unavailable: ${err.message}`);
    isRedisDown = true;
    lastRedisCheck = now;
    return null;
  }
}

async function safeRedisSet(key, value, options) {
  if (isRedisDown) return;
  try {
    await redis.set(key, value, options);
  } catch (err) {
    // Silently fail, circuit breaker already handled in Get
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const file = url.searchParams.get("file");

    if (!file) {
      return new NextResponse("Missing file", { status: 400 });
    }

    // ─── Smart URL Resolution ───
    let resolvedUrl = file;
    
    // 1. If it's a relative path starting with /, prepend the site URL
    if (resolvedUrl.startsWith("/")) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bhdocs.in";
      resolvedUrl = `${siteUrl}${resolvedUrl}`;
    } 
    // 2. If it's a simple slug or path without a protocol, assume it's in our GitHub storage
    else if (!resolvedUrl.startsWith("http")) {
      const GITHUB_BASE = "https://raw.githubusercontent.com/Bharat346/docs-storage/main";
      // Add .pdf extension if missing and no other extension present
      const hasExtension = /\.[a-z0-9]+$/i.test(resolvedUrl);
      const pathWithExt = hasExtension ? resolvedUrl : `${resolvedUrl}.pdf`;
      resolvedUrl = `${GITHUB_BASE}/${pathWithExt}`;
    }

    const safeKey = Buffer.from(file)
      .toString("base64")
      .replace(/[/+=]/g, "")
      .substring(0, 100);
    const cacheKey = `pdf:meta:${safeKey}`;

    // ─── Try Cache ───
    let meta = await safeRedisGet(cacheKey);
    if (meta && typeof meta === "string") {
      try {
        meta = JSON.parse(meta);
        // If cached URL is invalid (doesn't start with http), force re-resolution
        if (meta && typeof meta.url === 'string' && !meta.url.startsWith('http')) {
          meta = null;
        }
      } catch {
        meta = null;
      }
    }

    if (!meta) {
      meta = { url: resolvedUrl, contentType: "application/pdf" };
      await safeRedisSet(cacheKey, JSON.stringify(meta), {
        ex: SEVEN_DAYS,
      });
    }

    // ─── Fetch from Upstream ───
    console.log(`[PDF Proxy] Fetching: ${meta.url}`);
    const upstreamHeaders = {
      "Accept-Encoding": "identity",
    };
    const rangeHeader = req.headers.get("range");
    if (rangeHeader) {
      upstreamHeaders["Range"] = rangeHeader;
    }

    const upstream = await fetch(meta.url, {
      headers: upstreamHeaders,
      next: { revalidate: SEVEN_DAYS },
    });

    if (!upstream.ok && upstream.status !== 206) {
      return new NextResponse(`Upstream error: ${upstream.status}`, {
        status: upstream.status,
      });
    }

    // ─── Prepare Headers ───
    const headers = new Headers();
    headers.set("Content-Type", meta.contentType);
    headers.set("Accept-Ranges", "bytes");
    headers.set("X-Content-Type-Options", "nosniff");

    headers.set(
      "Cache-Control",
      `public, s-maxage=${SEVEN_DAYS}, max-age=${ONE_DAY}, stale-while-revalidate=${SEVEN_DAYS}`,
    );
    headers.set("CDN-Cache-Control", `public, max-age=${SEVEN_DAYS}, immutable`);
    headers.set("Vercel-CDN-Cache-Control", `public, max-age=${SEVEN_DAYS}, immutable`);

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
