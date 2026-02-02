import { NextRequest, NextResponse } from "next/server";
import { writeAccessLog } from "@/server/access-log";
import { getIPInfo } from "@/server/ip-info";
import { firewall } from "@/server/firewall";
import { withSecurityHeaders } from "@/server/security-headers";

/* =========================
   CONFIG
========================= */
const isProd = process.env.NODE_ENV === "production";
const BASE_URL = isProd
  ? "https://bharat-docs.vercel.app"
  : "http://localhost:3000";

const MAX_REDIRECTS = 2;

const COOKIE_SESSION = "web_session";
const COOKIE_VERIFIED = "session_verified";
const COOKIE_REDIRECTS = "auth_redirects";

/* =========================
   HELPERS
========================= */
function getIP(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.ip ??
    "unknown"
  );
}

async function verifySessionOnce(session) {
  try {
    const res = await fetch(`${BASE_URL}/api/session/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session }),
    });

    if (!res.ok) return false;
    const { valid } = await res.json();
    return valid === true;
  } catch {
    return false;
  }
}

/* =========================
   MIDDLEWARE
========================= */
export async function proxy(request) {
  const start = Date.now();
  const { pathname } = request.nextUrl;

  /* ---------- BYPASS STATIC & AUTH ---------- */
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/session") ||
    pathname === "/favicon.ico"
  ) {
    return withSecurityHeaders(NextResponse.next());
  }

  const ip = getIP(request);
  const ua = request.headers.get("user-agent") ?? "unknown";

  /* ---------- FIREWALL ---------- */
  const fw = firewall(request);
  if (fw) {
    queueMicrotask(async () => {
      await writeAccessLog({
        ipAddress: ip,
        userAgent: ua,
        path: pathname,
        method: request.method,
        status: "blocked",
        responseTime: Date.now() - start,
        ipInfo: await getIPInfo(ip),
      });
    });
    return withSecurityHeaders(fw);
  }

  /* ---------- PAGE NAVIGATION ---------- */
  const isHTML =
    request.method === "GET" &&
    request.headers.get("accept")?.includes("text/html");

  if (isHTML) {
    return withSecurityHeaders(NextResponse.next());
  }

  /* ---------- SESSION STATE ---------- */
  const session = request.cookies.get(COOKIE_SESSION)?.value;
  const verified = request.cookies.get(COOKIE_VERIFIED)?.value === "1";

  let sessionValid = verified;

  /* ---------- VERIFY ONLY ONCE ---------- */
  if (!verified && session) {
    sessionValid = await verifySessionOnce(session);
  }

  /* ---------- UNAUTHORIZED ---------- */
  if (!sessionValid) {
    // APIs never redirect
    if (pathname.startsWith("/api/")) {
      return withSecurityHeaders(
        new NextResponse("Unauthorized", { status: 401 })
      );
    }

    const redirects =
      Number(request.cookies.get(COOKIE_REDIRECTS)?.value ?? 0);

    if (redirects >= MAX_REDIRECTS) {
      const res = new NextResponse("Unauthorized", { status: 401 });
      res.cookies.delete(COOKIE_REDIRECTS);
      return withSecurityHeaders(res);
    }

    const res = NextResponse.redirect(
      new URL("/api/session/create", BASE_URL)
    );

    res.cookies.set(COOKIE_REDIRECTS, String(redirects + 1), {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 120,
      path: "/",
    });

    return withSecurityHeaders(res);
  }

  /* ---------- AUTH SUCCESS ---------- */
  const res = NextResponse.next();

  // Set verified flag ONCE
  if (!verified) {
    res.cookies.set(COOKIE_VERIFIED, "1", {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24h trust window
      path: "/",
    });
  }

  res.cookies.delete(COOKIE_REDIRECTS);

  /* ---------- LOG ---------- */
  queueMicrotask(async () => {
    await writeAccessLog({
      ipAddress: ip,
      userAgent: ua,
      path: pathname,
      method: request.method,
      status: "success",
      responseTime: Date.now() - start,
      ipInfo: await getIPInfo(ip),
    });
  });

  return withSecurityHeaders(res);
}

/* =========================
   MATCHER
========================= */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
