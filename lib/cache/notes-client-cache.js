/**
 * Client-side caching and prefetching utility for Notes Subtree
 */

const CACHE_PREFIX = "notes_subtree_";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

/**
 * Store a subtree in localStorage with an expiry timestamp
 */
export function setSubtreeCache(rootSlug, data) {
  try {
    const cacheData = {
      expiry: Date.now() + CACHE_DURATION,
      data,
    };
    localStorage.setItem(`${CACHE_PREFIX}${rootSlug}`, JSON.stringify(cacheData));
  } catch (e) {
    console.warn("Failed to write to localStorage:", e);
  }
}

/**
 * Get a subtree from localStorage, ensuring it hasn't expired
 */
export function getSubtreeCache(rootSlug) {
  try {
    const item = localStorage.getItem(`${CACHE_PREFIX}${rootSlug}`);
    if (!item) return null;

    const cacheData = JSON.parse(item);
    if (Date.now() > cacheData.expiry) {
      localStorage.removeItem(`${CACHE_PREFIX}${rootSlug}`);
      return null;
    }
    return cacheData.data;
  } catch (e) {
    return null;
  }
}

/**
 * Prefetch a subtree in the background using a microtask/idle callback
 * to avoid blocking UI interactions.
 */
export function prefetchSubtree(rootSlug) {
  if (typeof window === "undefined") return;

  // Check if cache already exists and is valid
  if (getSubtreeCache(rootSlug)) return;

  const performFetch = () => {
    fetch(`/api/notes/subtree?rootSlug=${encodeURIComponent(rootSlug)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then((data) => {
        setSubtreeCache(rootSlug, data);
      })
      .catch((err) => {
        console.error("Subtree prefetch failed:", err);
      });
  };

  // Run in a microtask / non-blocking idle callback
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => performFetch(), { timeout: 2000 });
  } else {
    // Fallback to queueMicrotask or setTimeout
    setTimeout(performFetch, 500);
  }
}
