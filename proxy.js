import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/server/session";
import { rateLimitRequest } from "./server/rate-limit";
import { writeAccessLog } from "./server/access-log";
import { getIPInfo } from "./server/ip-info";
import { firewall } from "./server/firewall";
import { withSecurityHeaders } from "./server/security-headers";

function getIP(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

const MAX_REDIRECTS = 2;
const REDIRECT_COOKIE = "auth_redirects";

export async function proxy(request) {
  const start = Date.now();
  const { pathname } = request.nextUrl;
  // console.log(request);

  /* ---------- SKIP PUBLIC ---------- */
  if (
    pathname.startsWith("/api/session") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public")
  ) {
    return withSecurityHeaders(NextResponse.next());
  }

  const ip = getIP(request);
  const ua = request.headers.get("user-agent");
  const session = request.cookies.get("web_session")?.value;

  /* ---------- FIREWALL (FIRST LINE OF DEFENSE) ---------- */
  const fwResponse = firewall(request);
  if (fwResponse) {
    queueMicrotask(async () => {
      const ipInfo = await getIPInfo(ip);
      await writeAccessLog({
        ipAddress: ip,
        userAgent: ua,
        path: pathname,
        method: request.method,
        status: "blocked",
        responseTime: Date.now() - start,
        ipInfo,
      });
    });

    return withSecurityHeaders(fwResponse);
  }

  /* ---------- RATE LIMIT ---------- */
  const rateLimitResult = await rateLimitRequest(request);
  if (!rateLimitResult.allowed) {
    queueMicrotask(async () => {
      const ipInfo = await getIPInfo(ip);
      await writeAccessLog({
        ipAddress: ip,
        userAgent: ua,
        path: pathname,
        method: request.method,
        status: "rate_limited",
        responseTime: Date.now() - start,
        ipInfo,
      });
    });
    return withSecurityHeaders(
      new NextResponse("Rate limit exceeded", {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfter),
        },
      }),
    );
  }

  /* ---------- VERIFY ---------- */
  if (!session || !verifySession(session)) {
    const redirectCount = Number(
      request.cookies.get(REDIRECT_COOKIE)?.value ?? 0,
    );

    if (redirectCount >= MAX_REDIRECTS) {
      queueMicrotask(async () => {
        const ipInfo = await getIPInfo(ip);
        await writeAccessLog({
          ipAddress: ip,
          userAgent: ua,
          path: pathname,
          method: request.method,
          status: "blocked",
          responseTime: Date.now() - start,
          ipInfo,
        });
      });

      const res = new NextResponse("Unauthorized", { status: 401 });
      res.cookies.delete(REDIRECT_COOKIE);
      return withSecurityHeaders(res);
    }

    const url = request.nextUrl.clone();
    url.pathname = "/api/session";

    const res = NextResponse.redirect(url);
    res.cookies.set(REDIRECT_COOKIE, String(redirectCount + 1), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 2, // 2 Minutes
      path: "/",
    });

    return withSecurityHeaders(res);
  }

  queueMicrotask(async () => {
    const ipInfo = await getIPInfo(ip);
    await writeAccessLog({
      ipAddress: ip,
      userAgent: ua,
      path: pathname,
      method: request.method,
      status: "success",
      responseTime: Date.now() - start,
      ipInfo,
    });
  });

  // Authenticated
  const res = NextResponse.next();
  res.cookies.delete(REDIRECT_COOKIE);

  return withSecurityHeaders(res);
}

export const config = {
  matcher: [
    /*
      Protect everything EXCEPT:
      - static files
      - api/session
    */
    "/((?!_next/static|_next/image|favicon.ico|api/session).*)",
  ],
};
