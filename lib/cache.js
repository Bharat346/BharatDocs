const CACHE_PREFIX = "app_cache:";

export function setCache(key, data, ttlMs) {
  if (typeof window === "undefined") return;

  try {
    const payload = {
      timestamp: Date.now(),
      ttl: ttlMs,
      data,
    };

    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(payload));
  } catch (err) {
    console.error("setCache failed:", err);
  }
}

export function getCache(key) {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    const { timestamp, ttl, data } = JSON.parse(raw);

    if (Date.now() - timestamp > ttl) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return data;
  } catch (err) {
    console.error("getCache failed:", err);
    return null;
  }
}

export function clearCache(key) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CACHE_PREFIX + key);
}