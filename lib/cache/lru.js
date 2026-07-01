import { LRUCache } from "lru-cache";

/* ── Namespace-scoped LRU caches with tuned TTLs ── */
const caches = {
  queries: new LRUCache({ max: 300, ttl: 1000 * 60 * 5 }),
  mdx: new LRUCache({ max: 200, ttl: 1000 * 60 * 60 }),
  github: new LRUCache({ max: 100, ttl: 1000 * 60 * 60 * 6 }),
  tags: new LRUCache({ max: 10, ttl: 1000 * 60 * 30 }),
  search: new LRUCache({ max: 50, ttl: 1000 * 60 * 2 }),
};

/**
 * Get-or-fetch with automatic LRU caching.
 * @param {"queries"|"mdx"|"github"|"tags"|"search"} namespace
 * @param {string} key - Unique cache key
 * @param {() => Promise<any>} fetcher - Async function to call on cache miss
 */
export async function cached(namespace, key, fetcher) {
  const cache = caches[namespace];
  if (!cache) throw new Error(`Unknown cache namespace: ${namespace}`);

  const existing = cache.get(key);
  if (existing !== undefined) return existing;

  const data = await fetcher();
  if (data !== undefined && data !== null) {
    cache.set(key, data);
  }
  return data;
}

/**
 * Manually invalidate a cached entry or entire namespace.
 */
export function invalidate(namespace, key) {
  const cache = caches[namespace];
  if (!cache) return;
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
