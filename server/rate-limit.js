import { redis } from "./redis";
import { db } from "@/lib/db";
import { rateLimits, securityEvents } from "@/lib/db/schema";
import crypto from "crypto";

/* =========================
   CONFIG
========================= */
const WINDOW_SECONDS = 60; // 1 minute window
const DEFAULT_LIMIT = 60; // 60 req / window
const AUTH_LIMIT = 5; // 5 req / window for auth
const BLOCK_SECONDS = 60 * 10; // 10 min hard block

/* =========================
   HELPERS
========================= */
function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function getIP(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

function getUserAgent(request) {
  return request.headers.get("user-agent");
}

function getSession(request) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;

  const match = cookie.match(/web_session=([^;]+)/);
  return match?.[1] ?? null;
}

/* =========================
   MAIN
========================= */
export async function rateLimitRequest(request) {
  const ip = getIP(request);
  const ua = getUserAgent(request);
  const session = getSession(request);
  const url = new URL(request.url);

  /* ---------- KEY STRATEGY (SAFE) ---------- */
  const identity = `${session ?? "anon"}:${ip}`;
  const hashedKey = sha256(identity);

  // Global per-identity key (prevents path rotation bypass)
  const redisKey = `rl:${hashedKey}`;
  const blockKey = `block:${hashedKey}`;

  /* ---------- HARD BLOCK CHECK ---------- */
  const blocked = await redis.get(blockKey);
  if (blocked) {
    return {
      allowed: false,
      retryAfter: BLOCK_SECONDS,
    };
  }

  /* ---------- RATE COUNT ---------- */
  const count = await redis.incr(redisKey);

  if (count === 1) {
    // Slight TTL jitter to avoid hot-key sync
    await redis.expire(
      redisKey,
      WINDOW_SECONDS + Math.floor(Math.random() * 3),
    );
  }

  const endpointLimit = url.pathname.startsWith("/api/session") || url.pathname.startsWith("/api/admin") 
    ? AUTH_LIMIT 
    : DEFAULT_LIMIT;

  if (count <= endpointLimit) {
    return { allowed: true };
  }

  /* ---------- BLOCK ---------- */
  await redis.set(blockKey, "1", { ex: BLOCK_SECONDS });

  /* ---------- ASYNC DB WRITE ---------- */
  queueMicrotask(async () => {
    try {
      await db.insert(rateLimits).values({
        key: hashedKey,
        type: session ? "session" : "ip",
        endpoint: url.pathname,
        count,
        windowStart: new Date(Date.now() - WINDOW_SECONDS * 1000),
        expiresAt: new Date(Date.now() + BLOCK_SECONDS * 1000),
        isBlocked: true,
      });

      await db.insert(securityEvents).values({
        event: "rate_limit",
        severity: "warn",
        ipAddress: ip,
        userAgent: ua,
        path: url.pathname,
        method: request.method,
        details: JSON.stringify({
          limit: endpointLimit,
          windowSeconds: WINDOW_SECONDS,
          blockSeconds: BLOCK_SECONDS,
        }),
      });
    } catch {
      // Never crash request path
    }
  });

  return {
    allowed: false,
    retryAfter: BLOCK_SECONDS,
  };
}
