import { NextRequest, NextResponse } from "next/server";
import { withSecurityHeaders } from "./security-headers";

const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "https://bhdocs.in",
  "https://www.bhdocs.in",
]);

const BLOCKED_UA = [
  /curl/i,
  /wget/i,
  /python/i,
  /perl/i,
  /ruby/i,
  /java/i,
  /php/i,
  /golang/i,
  /node/i,
  /httpclient/i,
  /libwww/i,
  /lynx/i,
  /links/i,
  /elinks/i,
  /httrack/i,
  /nikto/i,
  /nmap/i,
  /sqlmap/i,
  /metasploit/i,
  /burpsuite/i,
  /zap/i,
  /w3af/i,
  /arachni/i,
  /skipfish/i,
  /wfuzz/i,
  /dirb/i,
  /gobuster/i,
  /ffuf/i,
  /phantom/i,
  /puppeteer/i,
  /selenium/i,
  /playwright/i,
  /zombie/i,
  /casper/i,
];

const TRUSTED_BOTS = [
  // Google
  /googlebot/i,
  /adsbot-google/i,
  /mediapartners-google/i,
  /google-inspectiontool/i,
  //Bing
  /bingbot/i,
  /msnbot/i,
  /slurp/i,
];

/* =========================
   ATTACK SIGNATURES
========================= */

const XSS_DETECTION_PATTERNS = [
  // Script tags (obvious)
  /<\s*script\b/i,
  /<\/\s*script\s*>/i,

  // Dangerous URL schemes
  /\bjavascript\s*:/i,
  /\bvbscript\s*:/i,
  /\bdata\s*:\s*text\/html/i,

  // Inline event handlers (generic form)
  /\bon\w+\s*=/i,

  // SVG-based payloads (common bypass)
  /<\s*svg\b/i,
  /<\s*math\b/i,

  // Iframe & embedding
  /<\s*iframe\b/i,
  /<\s*object\b/i,
  /<\s*embed\b/i,

  // JavaScript execution primitives
  /\beval\s*\(/i,
  /\bFunction\s*\(/i,
  /\bsetTimeout\s*\(/i,
  /\bsetInterval\s*\(/i,

  // DOM access targeting
  /\bdocument\s*\.\s*cookie/i,
  /\bdocument\s*\.\s*location/i,
  /\bwindow\s*\.\s*location/i,

  // HTML injection attempts
  /<\s*img[^>]+on\w+\s*=/i,
  /<\s*a[^>]+href\s*=\s*javascript:/i,
];

const SQLI_DETECTION_PATTERNS = [
  // Tautologies (classic attack noise)
  /\b(or|and)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/i,

  // UNION-based injection
  /\bunion\s+select\b/i,

  // Stacked queries (only suspicious when repeated)
  /;\s*(select|insert|update|delete|drop|truncate)\b/i,

  // SQL comments (combined with keywords)
  /(--|#)\s*(select|insert|update|delete|drop)\b/i,

  // Time-based blind SQLi
  /\bsleep\s*\(/i,
  /\bbenchmark\s*\(/i,
  /\bwaitfor\s+delay\b/i,
];

const CMD_DETECTION_PATTERNS = [
  // Command chaining
  /(?:^|[^\\])(?:\|\||&&|;|\|)/,

  // Subshell execution
  /\$\([^)]*\)/,
  /`[^`]+`/,

  // Redirection
  />\s*[^ ]+/,
  /<\s*[^ ]+/,

  // Windows CMD chaining
  /\b(cmd\.exe|powershell)\b/i,
];

const XXE_DETECTION_PATTERNS = [
  // DOCTYPE with external identifier
  /<!DOCTYPE[^>]+(SYSTEM|PUBLIC)\b/i,

  // ENTITY declaration with external reference
  /<!ENTITY[^>]+(SYSTEM|PUBLIC)\b/i,

  // Parameter entities (common XXE)
  /<!ENTITY\s+%\s*\w+/i,
];

/* =========================
   HELPERS
========================= */

function hasMaliciousPayload(input) {
  const patterns = [
    ...XSS_DETECTION_PATTERNS,
    ...SQLI_DETECTION_PATTERNS,
    ...CMD_DETECTION_PATTERNS,
    ...XXE_DETECTION_PATTERNS,
    ...SQLI_DETECTION_PATTERNS,
  ];

  return patterns.some((re) => re.test(input));
}

function isTrustedBot(ua) {
  if (!ua) return false;
  return TRUSTED_BOTS.some((re) => re.test(ua));
}

function isAllowedUA(ua) {
  if (!ua) return false;
  if (isTrustedBot(ua)) return true;
  if (BLOCKED_UA.some((re) => re.test(ua))) return false;
  return true;
}

export function firewall(request) {
  const ua = request.headers.get("user-agent");
  const url = request.nextUrl;

  // Enforce origin ONLY for state-changing requests
  if (request.method !== "GET" && request.method !== "HEAD") {
    const origin = request.headers.get("origin");

    if (!origin || !ALLOWED_ORIGINS.has(origin)) {
      return withSecurityHeaders(
        NextResponse.json({ error: "Forbidden origin" }, { status: 403 }),
      );
    }
  }

  /* ---------- USER AGENT ---------- */
  if (!isAllowedUA(ua)) {
    return withSecurityHeaders(
      NextResponse.json(
        { error: "Non-browser client blocked" },
        { status: 403 },
      ),
    );
  }

  /* ---------- METHOD LOCK ---------- */
  if (!["GET", "POST", "PUT", "DELETE"].includes(request.method)) {
    return withSecurityHeaders(
      NextResponse.json({ error: "Method not allowed" }, { status: 405 }),
    );
  }

  /* ---------- PAYLOAD INSPECTION ---------- */
  const combinedInput = url.pathname + url.search;

  if (hasMaliciousPayload(combinedInput)) {
    return withSecurityHeaders(
      NextResponse.json(
        { error: "Malicious request detected" },
        { status: 403 },
      ),
    );
  }

  return null; // allowed
}
