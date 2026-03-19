import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { isAuthenticatedAdmin } from "@/lib/auth-server";
import { list } from "@vercel/blob";

export async function GET() {
  try {
    if (!(await isAuthenticatedAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: { status: "unknown", message: null },
        vercelBlob: { status: "unknown", message: null },
        github: { status: "unknown", message: null },
        env: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          vercel_rw_token_READ_WRITE_TOKEN:
            !!process.env.vercel_rw_token_READ_WRITE_TOKEN,
          github_AT: !!process.env.github_AT,
          SESSION_SECRET: !!process.env.SESSION_SECRET,
        },
      },
    };

    // 1. Check Database
    try {
      await db.execute(sql`SELECT 1`);
      health.checks.database.status = "up";
    } catch (e) {
      health.status = "degraded";
      health.checks.database.status = "down";
      health.checks.database.message = e.message;
    }

    // 2. Check Vercel Blob
    try {
      await list({
        limit: 1,
        token: process.env.vercel_rw_token_READ_WRITE_TOKEN,
      });
      health.checks.vercelBlob.status = "up";
    } catch (e) {
      health.status = "degraded";
      health.checks.vercelBlob.status = "down";
      health.checks.vercelBlob.message = e.message;
    }

    // 3. Check GitHub (simple reachability)
    try {
      const ghRes = await fetch("https://api.github.com/zen", {
        headers: { Authorization: `token ${process.env.github_AT}` },
      });
      if (ghRes.ok) {
        health.checks.github.status = "up";
      } else {
        throw new Error(`GitHub API returned ${ghRes.status}`);
      }
    } catch (e) {
      health.status = "degraded";
      health.checks.github.status = "down";
      health.checks.github.message = e.message;
    }

    return NextResponse.json(health);
  } catch (error) {
    console.error("Health Check Error:", error);
    return NextResponse.json(
      { status: "unhealthy", error: error.message },
      { status: 500 },
    );
  }
}
