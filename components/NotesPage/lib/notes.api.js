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
 * Fetch notes for a given collection and optional parent slug
 * @param {string} collectionName
 * @param {string} [parentSlug]
 * @param {AbortSignal} [signal]
 */
export async function fetchNotes(collectionName, parentSlug, signal) {
  if (!collectionName) return [];
  const apiUrl = `/api/notes?collection=${collectionName}${
    parentSlug ? `&parentSlug=${parentSlug}` : ""
  }`;
  return await fetchJson(apiUrl, signal);
}

