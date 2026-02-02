export function withSecurityHeaders(res) {
  const isProd = process.env.NODE_ENV === "production";

  const csp = isProd
    ? [
        "default-src 'self'",

        // Next.js needs inline scripts for hydration
        "script-src 'self' 'unsafe-inline'",

        // Explicitly allow inline script elements
        "script-src-elem 'self' 'unsafe-inline'",

        // Inline styles & style attributes (Next + Tailwind)
        "style-src 'self' 'unsafe-inline'",
        "style-src-attr 'unsafe-inline'",

        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "media-src 'self' data:",

        "frame-ancestors 'none'",
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
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self' ws://localhost:*",
        "frame-ancestors 'none'",
        "base-uri 'none'",
        "form-action 'self'",
        "object-src 'none'",
      ].join("; ");

  res.headers.set("Content-Security-Policy", csp);

  /* ---------- Standard Hardening ---------- */
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
