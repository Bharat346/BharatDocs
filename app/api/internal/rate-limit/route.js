export const runtime = "nodejs";

import { NextRequest } from "next/server";
import crypto from "crypto";
import { redis } from "@/server/redis";
import { db } from "@/lib/db/index";
import { rateLimits, securityEvents } from "@/lib/db/schema";

const WINDOW_SECONDS = 60;
const LIMIT = 20;
const BLOCK_SECONDS = 60 * 10;

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req) {
  const {
    ip,
    userAgent,
    path,
    method,
    session,
  } = await req.json();

  const identity = `${session ?? "anon"}:${ip}`;
  const key = sha256(identity);

  const redisKey = `rl:${key}`;
  const blockKey = `block:${key}`;

  if (await redis.get(blockKey)) {
    return Response.json({
      allowed: false,
      retryAfter: BLOCK_SECONDS,
    });
  }

  const count = await redis.incr(redisKey);

  if (count === 1) {
    await redis.expire(redisKey, WINDOW_SECONDS);
  }

  if (count <= LIMIT) {
    return Response.json({ allowed: true });
  }

  await redis.set(blockKey, "1", { ex: BLOCK_SECONDS });

  // async DB logging
  queueMicrotask(async () => {
    try {
      await db.insert(rateLimits).values({
        key,
        type: session ? "session" : "ip",
        endpoint: path,
        count,
        windowStart: new Date(Date.now() - WINDOW_SECONDS * 1000),
        expiresAt: new Date(Date.now() + BLOCK_SECONDS * 1000),
        isBlocked: true,
      });

      await db.insert(securityEvents).values({
        event: "rate_limit",
        severity: "warn",
        ipAddress: ip,
        userAgent,
        path,
        method,
        details: JSON.stringify({ LIMIT, WINDOW_SECONDS, BLOCK_SECONDS }),
      });
    } catch {}
  });

  return Response.json({
    allowed: false,
    retryAfter: BLOCK_SECONDS,
  });
}
