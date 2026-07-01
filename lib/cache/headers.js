/**
 * L3: HTTP response cache header helpers.
 * Sets Cache-Control for browser + CDN/Vercel Edge caching.
 */

const PROFILES = {
  listings: { sMaxAge: 60, swr: 300, maxAge: 0 },
  detail: { sMaxAge: 3600, swr: 7200, maxAge: 300 },
  tags: { sMaxAge: 3600, swr: 7200, maxAge: 300 },
  github: { sMaxAge: 86400, swr: 172800, maxAge: 3600 },
  notifications: { sMaxAge: 30, swr: 60, maxAge: 0 },
  none: null,
};

/**
 * Apply cache headers to a Response or NextResponse.
 * @param {Response} response
 * @param {"listings"|"detail"|"tags"|"github"|"notifications"|"none"} profile
 */
export function withCacheHeaders(response, profile = "listings") {
  const p = PROFILES[profile];

  if (!p) {
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  response.headers.set(
    "Cache-Control",
    `public, s-maxage=${p.sMaxAge}, stale-while-revalidate=${p.swr}, max-age=${p.maxAge}`,
  );

  return response;
}
