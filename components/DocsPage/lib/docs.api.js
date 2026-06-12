// lib/docs.api.js


// Helper: non-blocking JSON fetch with local cache
async function fetchJson(url, signal, ttl = 3600000) { // 1 hour TTL
  const cacheKey = `client_cache_${url}`;
  const now = Date.now();
  
  if (typeof window !== "undefined") {
    try {
      const cachedStr = localStorage.getItem(cacheKey);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        if (now - cached.timestamp < ttl) {
          console.log(`[Client Cache] Hit: ${url}`);
          return cached.data;
        }
      }
    } catch (e) {}
  }

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);

  const text = await res.text();
  const json = JSON.parse(text);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data: json }));
      console.log(`[Client Cache] Stored: ${url}`);
    } catch (e) {}
  }

  return json;
}

/**
 * Fetch children docs for a given parent slug
 * @param {string} slug
 * @param {AbortSignal} [signal]
 */
// export async function fetchChildren(slug, signal) {
//   if (!slug) return [];
//   return await fetchJson(`/api/docs?parentSlug=${slug}`, signal);
// }

/**
 * Fetch MDX content for a given filePath
 * @param {string} filePath
 * @param {AbortSignal} [signal]
 */
// export async function fetchMdxContent(filePath, signal) {
//   if (!filePath) return null;
//   const url = `/api/github/content?url=${encodeURIComponent(filePath)}`;
//   return await fetchJson(url, signal);
// }

export async function fetchDocs(signal) {
    const url = `/api/docs?collection=Docs&parentSlug=`;
    return await fetchJson(url, signal);
}
