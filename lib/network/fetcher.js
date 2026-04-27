// lib/network/fetcher.js

const requestQueue = new Map();

/**
 * Enhanced fetch with deduplication, retries, and caching
 */
export async function enhancedFetch(url, options = {}) {
  const {
    retries = 3,
    backoff = 1000,
    cacheTTL = 3600,
    deduplicate = true,
    ...fetchOptions
  } = options;

  const cacheKey = url + JSON.stringify(fetchOptions.headers || {});

  // Request deduplication
  if (deduplicate && requestQueue.has(cacheKey)) {
    return requestQueue.get(cacheKey);
  }

  const mergeHeaders = (base, extra) => {
    const headers = new Headers(extra || {});
    if (base) {
      Object.entries(base).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }
    return Object.fromEntries(headers.entries());
  };

  const performFetch = async (attempt = 0) => {
    try {
      const mergedHeaders = mergeHeaders(
        { 'Cache-Control': `public, max-age=${cacheTTL}, stale-while-revalidate=${cacheTTL * 2}` },
        fetchOptions.headers
      );

      const res = await fetch(url, {
        ...fetchOptions,
        headers: mergedHeaders,
      });

      // Retry on 5xx or specific network errors, but return 4xx (like 404) immediately
      if (!res.ok && res.status >= 500 && attempt < retries) {
        throw new Error(`HTTP ${res.status}`);
      }

      return res;
    } catch (err) {
      const isStatusError = err.message.startsWith('HTTP');
      if (attempt < retries) {
        const delay = backoff * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
        return performFetch(attempt + 1);
      }
      throw err;
    }
  };

  const promise = performFetch().finally(() => {
    if (deduplicate) requestQueue.delete(cacheKey);
  });

  if (deduplicate) requestQueue.set(cacheKey, promise);
  
  const response = await promise;
  return response.clone();
}

export const NETWORK_CONFIG = {
  CACHE_TTL: 3600,
  REVALIDATE_TTL: 86400,
  GITHUB_RAW_PREFIX: 'https://raw.githubusercontent.com/Bharat346/docs-storage/main/',
};
