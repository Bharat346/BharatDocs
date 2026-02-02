export function withSecurityHeaders(res) {
  const isProd = process.env.NODE_ENV === "production";

  const csp = isProd
    ? [
        // Base rule (MUST exist)
        "default-src 'self'",

        // Scripts
        "script-src 'self' 'unsafe-inline'",
        "script-src-elem 'self' 'unsafe-inline'",

        // Styles
        "style-src 'self' 'unsafe-inline'",
        "style-src-attr 'unsafe-inline'",

        // Images (PDF renders images via canvas)
        "img-src 'self' data: blob: https://*.vercel-storage.com",

        // Fonts
        "font-src 'self' data:",

        // PDF.js worker
        "worker-src 'self' blob:",

        // PDF fetch (CRITICAL)
        "connect-src 'self' https://*.vercel-storage.com https://bhdocs.in https://bharat-docs.vercel.app",

        // Media inside PDFs (rare but safe)
        "media-src 'self' blob:",

        // No iframes allowed
        "frame-src 'self' https://*.vercel-storage.com",
        "frame-ancestors 'self' https://*.vercel-storage.com",

        // Lock down misc
        "base-uri 'none'",
        "form-action 'self'",
        "object-src 'none'",
      ].join("; ")
    : [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "script-src-elem 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "style-src-attr 'unsafe-inline'",
        "img-src 'self' data: blob: https://*.vercel-storage.com",
        "font-src 'self' data:",
        "worker-src 'self' blob:",
        "connect-src 'self' ws://localhost:* https://*.vercel-storage.com https://bhdocs.in https://bharat-docs.vercel.app",
        "media-src 'self' blob:",
        "frame-src 'self' https://*.vercel-storage.com",
        "frame-ancestors 'self' https://*.vercel-storage.com",
        "base-uri 'none'",
        "form-action 'self'",
        "object-src 'none'",
      ].join("; ");

  res.headers.set("Content-Security-Policy", csp);

  /* ---------- Security Hardening ---------- */
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  res.headers.set(
    "Permissions-Policy",
    [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "bluetooth=()",
    ].join(", "),
  );

  if (isProd) {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  return res;
}
