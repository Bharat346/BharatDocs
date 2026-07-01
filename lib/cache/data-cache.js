import { unstable_cache } from "next/cache";

/**
 * Create a Next.js data cache wrapper with tag-based invalidation.
 * Persists across serverless invocations on Vercel.
 *
 * @param {Function} fn - The async function to cache
 * @param {string[]} keyParts - Unique key parts for this cache entry
 * @param {object} opts
 * @param {number} opts.revalidate - Seconds before revalidation
 * @param {string[]} opts.tags - Tags for targeted invalidation
 */
export function createDataCache(fn, keyParts, { revalidate = 300, tags = [] } = {}) {
  if (process.env.NODE_ENV === "development") {
    // In development, skip unstable_cache to avoid stale data during iteration
    return fn;
  }

  return unstable_cache(fn, keyParts, { revalidate, tags });
}
