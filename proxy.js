import { NextResponse } from "next/server";
import { writeAccessLog } from "@/server/access-log";
import { getIPInfo } from "@/server/ip-info";
import { firewall } from "@/server/firewall";
import { withSecurityHeaders, generateNonce } from "@/server/security-headers";

/* =========================
   CONFIG
========================= */
const isProd = process.env.NODE_ENV === "production";
const BASE_URL = isProd ? "https://bhdocs.in" : "http://localhost:3000";

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

  /* ---------- NONCE & HEADERS ---------- */
  const nonce = generateNonce();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  /* ---------- BASIC BYPASS ---------- */
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/session") ||
    pathname === "/favicon.ico"
  ) {
    const res = NextResponse.next({
      request: { headers: requestHeaders },
    });
    return withSecurityHeaders(res, nonce);
  }

  /* ---------- FILE UPLOAD DETECTION ---------- */
  const contentType = request.headers.get("content-type") || "";
  const isFileUpload =
    contentType.includes("application/pdf") ||
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/octet-stream");

  const ip = getIP(request);
  const ua = request.headers.get("user-agent") ?? "unknown";

  /* ---------- FILE UPLOAD FLOW (SAFE) ---------- */
  if (isFileUpload) {
    // Optional firewall
    const fw = firewall(request);
    if (fw) return withSecurityHeaders(fw, nonce);

    const res = NextResponse.next({
      request: { headers: requestHeaders },
    });

    // Async logging
    queueMicrotask(async () => {
      await writeAccessLog({
        ipAddress: ip,
        userAgent: ua,
        path: pathname,
        method: request.method,
        status: "upload",
        responseTime: Date.now() - start,
        ipInfo: await getIPInfo(ip),
      });
    });

    return withSecurityHeaders(res, nonce);
  }

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

    return withSecurityHeaders(fw, nonce);
  }

  /* ---------- PAGE NAVIGATION ---------- */
  const isHTML =
    request.method === "GET" &&
    request.headers.get("accept")?.includes("text/html");

  if (isHTML) {
    const res = NextResponse.next({
      request: { headers: requestHeaders },
    });
    return withSecurityHeaders(res, nonce);
  }

  /* ---------- SESSION STATE ---------- */
  const session = request.cookies.get(COOKIE_SESSION)?.value;
  const verified = request.cookies.get(COOKIE_VERIFIED)?.value === "1";

  let sessionValid = verified;

  /* ---------- VERIFY SESSION ONCE ---------- */
  if (!verified && session) {
    sessionValid = await verifySessionOnce(session);
  }

  /* ---------- UNAUTHORIZED ---------- */
  if (!sessionValid) {
    // APIs → no redirect
    if (pathname.startsWith("/api/")) {
      return withSecurityHeaders(
        new NextResponse("Unauthorized", { status: 401 }),
        nonce
      );
    }

    const redirects = Number(
      request.cookies.get(COOKIE_REDIRECTS)?.value ?? 0
    );

    if (redirects >= MAX_REDIRECTS) {
      const res = new NextResponse("Unauthorized", { status: 401 });
      res.cookies.delete(COOKIE_REDIRECTS);
      return withSecurityHeaders(res, nonce);
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

    return withSecurityHeaders(res, nonce);
  }

  /* ---------- AUTH SUCCESS ---------- */
  const res = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set verified cookie once
  if (!verified) {
    res.cookies.set(COOKIE_VERIFIED, "1", {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
  }

  res.cookies.delete(COOKIE_REDIRECTS);

  /* ---------- LOG SUCCESS ---------- */
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

  return withSecurityHeaders(res, nonce);
}

/* =========================
   MATCHER
========================= */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};