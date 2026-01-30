import { NextRequest, NextResponse } from "next/server";
import {
  firewallMiddleware,
  securityHeadersMiddleware,
} from "@/server/firewallEdge";
import { db } from "@/lib/db/index";
import {
  securityEvents,
  accessLogs,
  visitors,
  fingerprints,
} from "@/lib/db/schema";
import { eq, and, gt, desc } from "drizzle-orm";

// IP Geolocation service (free tier)
async function getIPInfo(ip) {
  if (ip === "::1" || ip === "127.0.0.1") {
    return {
      country: "Local",
      city: "Local",
      isp: "Local",
      isTor: false,
      isVpn: false,
      isProxy: false,
      isDatacenter: false,
    };
  }

  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,city,isp,proxy,hosting`,
    );
    const data = await response.json();

    if (data.status === "success") {
      return {
        country: data.country || "Unknown",
        city: data.city || "Unknown",
        isp: data.isp || "Unknown",
        isTor: false, // ip-api doesn't detect Tor directly
        isVpn: data.proxy || false,
        isProxy: data.proxy || false,
        isDatacenter: data.hosting || false,
      };
    }
  } catch (error) {
    console.error("IP geolocation failed:", error);
  }

  return {
    country: "Unknown",
    city: "Unknown",
    isp: "Unknown",
    isTor: false,
    isVpn: false,
    isProxy: false,
    isDatacenter: false,
  };
}

// Check recent suspicious activity
async function checkSuspiciousActivity(fingerprintHash, ip) {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Check for multiple blocks
    const recentBlocks = await db
      .select()
      .from(securityEvents)
      .where(
        and(
          eq(securityEvents.ipAddress, ip),
          eq(securityEvents.severity, "critical"),
          gt(securityEvents.createdAt, oneHourAgo),
        ),
      )
      .limit(5);

    if (recentBlocks.length >= 3) {
      return {
        suspicious: true,
        reason: "multiple_blocks_recently",
        count: recentBlocks.length,
      };
    }

    // Check rapid access pattern
    const recentAccess = await db
      .select()
      .from(accessLogs)
      .where(
        and(
          eq(accessLogs.ipAddress, ip),
          gt(accessLogs.accessedAt, new Date(Date.now() - 5 * 60 * 1000)),
        ),
      )
      .orderBy(desc(accessLogs.accessedAt));

    if (recentAccess.length > 50) {
      return {
        suspicious: true,
        reason: "rapid_access_pattern",
        count: recentAccess.length,
      };
    }
  } catch (err) {
    console.error("Error checking suspicious activity:", err);
  }

  return { suspicious: false };
}

function isLocalRequest(ip) {
  if (!ip) return false;

  // handle "127.0.0.1, proxy-ip"
  const firstIp = ip.split(",")[0].trim();

  return (
    firstIp === "127.0.0.1" || firstIp === "::1" || firstIp === "localhost" || firstIp === "::ffff:127.0.0.1"
  );
}

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;

  // Skip static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return securityHeadersMiddleware(request);
  }

  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    request.ip ||
    "unknown";

  //////////// Development Purpose only //////////////
  //////////// Development Purpose only //////////////
  //////////// Development Purpose only //////////////
  //////////// Development Purpose only //////////////
  //////////// Development Purpose only //////////////
  //////////// Development Purpose only //////////////
  //////////// Development Purpose only //////////////
  //////////// Development Purpose only //////////////
  //////////// comment out in development //////////////
  // if (isLocalRequest(ip)) {
  //   const response = securityHeadersMiddleware(request);
  //   response.headers.set("X-Firewall-Status", "local-allow");
  //   response.headers.set("X-Visitor-ID", "local-dev");
  //   return response;
  // }

  const ua = request.headers.get("user-agent") || "";
  const method = request.method;
  const referrer = request.referrer || "";

  // Get fingerprint from client (FingerprintJS)
  const fingerprintHash = request.cookies.get("fp")?.value || `${ip}-${ua}`;

  const fingerprint = {
    hash: fingerprintHash,
    ip,
    ua,
    accept: request.headers.get("accept") || "",
    language: request.headers.get("accept-language") || "",
  };

  // Apply firewall
  const firewallResult = await firewallMiddleware(request);
  const firewallStatus = firewallResult.headers.get("X-Firewall-Status");

  if (firewallStatus !== "passed") {
    const geoInfo = await getIPInfo(ip);

    // Log blocked access
    try {
      await db.insert(securityEvents).values({
        event: "firewall_block",
        severity: "critical",
        ipAddress: ip,
        userAgent: ua,
        path: pathname,
        method,
        details: JSON.stringify({
          reason: firewallResult.headers.get("X-Firewall-Reason") || "Unknown",
          referrer,
          fingerprint: fingerprint.hash,
          geoInfo,
          headers: Object.fromEntries(request.headers),
          query: Object.fromEntries(new URLSearchParams(search)),
        }),
      });

      // Upsert fingerprint
      const existingFingerprint = await db
        .select()
        .from(fingerprints)
        .where(eq(fingerprints.fingerprint, fingerprint.hash))
        .limit(1);

      if (existingFingerprint.length > 0) {
        await db
          .update(fingerprints)
          .set({
            lastSeen: new Date(),
            isSuspicious: true,
            ipAddress: ip,
            userAgent: ua,
          })
          .where(eq(fingerprints.id, existingFingerprint[0].id));
      } else {
        await db.insert(fingerprints).values({
          fingerprint: fingerprint.hash,
          ipAddress: ip,
          userAgent: ua,
          isSuspicious: true,
          lastSeen: new Date(),
        });
      }
    } catch (err) {
      console.error("Failed to log firewall block:", err);
    }

    return firewallResult;
  }

  // Check suspicious activity
  const suspiciousCheck = await checkSuspiciousActivity(fingerprint.hash, ip);
  if (suspiciousCheck.suspicious) {
    await db.insert(securityEvents).values({
      event: "suspicious_pattern",
      severity: "warn",
      ipAddress: ip,
      userAgent: ua,
      path: pathname,
      method,
      details: JSON.stringify({
        reason: suspiciousCheck.reason,
        count: suspiciousCheck.count,
        fingerprint: fingerprint.hash,
      }),
    });
  }

  const geoInfo = await getIPInfo(ip);

  // Upsert visitor
  const visitorKey = fingerprint.hash.substring(0, 32);
  const existingVisitor = await db
    .select()
    .from(visitors)
    .where(eq(visitors.username, visitorKey))
    .limit(1);

  if (existingVisitor.length > 0) {
    await db
      .update(visitors)
      .set({
        ipHash: btoa(ip),
        userAgent: ua,
        lastSeen: new Date(),
      })
      .where(eq(visitors.username, visitorKey));
  } else {
    await db.insert(visitors).values({
      username: visitorKey,
      ipHash: btoa(ip),
      userAgent: ua,
      firstSeen: new Date(),
      lastSeen: new Date(),
    });
  }

  // Upsert fingerprint
  const existingFingerprint = await db
    .select()
    .from(fingerprints)
    .where(eq(fingerprints.fingerprint, fingerprint.hash))
    .limit(1);
  let fingerprintId;
  if (existingFingerprint.length > 0) {
    fingerprintId = existingFingerprint[0].id;
    await db
      .update(fingerprints)
      .set({
        lastSeen: new Date(),
        ipAddress: ip,
        userAgent: ua,
      })
      .where(eq(fingerprints.id, fingerprintId));
  } else {
    const result = await db
      .insert(fingerprints)
      .values({
        fingerprint: fingerprint.hash,
        ipAddress: ip,
        userAgent: ua,
        lastSeen: new Date(),
      })
      .returning({ id: fingerprints.id });
    fingerprintId = result[0]?.id;
  }

  // Log access
  await db.insert(accessLogs).values({
    username: visitorKey,
    fingerprintId,
    ipAddress: ip,
    userAgent: ua,
    path: pathname,
    method,
    statusCode: 200,
    country: geoInfo.country,
    city: geoInfo.city,
    isp: geoInfo.isp,
    isTor: geoInfo.isTor,
    isVpn: geoInfo.isVpn,
    isProxy: geoInfo.isProxy,
    isDatacenter: geoInfo.isDatacenter,
    accessedAt: new Date(),
  });

  // Apply security headers
  const response = securityHeadersMiddleware(request);
  response.headers.set("X-Visitor-ID", fingerprint.hash);

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
