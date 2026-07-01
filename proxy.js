import { NextResponse } from "next/server";
import { firewall } from "@/server/firewall";
import { withSecurityHeaders, generateNonce } from "@/server/security-headers";

/* =========================
   MIDDLEWARE (simplified)
========================= */
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  /* ── Nonce for CSP ── */
  const nonce = generateNonce();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  /* ── Static / internal bypass ── */
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/api/")
  ) {
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    return withSecurityHeaders(res, nonce);
  }

  /* ── Firewall check ── */
  const fw = firewall(request);
  if (fw) return withSecurityHeaders(fw, nonce);

  /* ── Pass through ── */
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  return withSecurityHeaders(res, nonce);
}

/* =========================
   MATCHER
========================= */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};