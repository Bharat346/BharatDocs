import { useEffect, useState, useRef } from "react";

/**
 * Ultra-fast PDF loader with dual-layer caching:
 *  1. In-memory LRU for instant re-access during session
 *  2. Browser Cache API for cross-session persistence
 *
 * The loader returns the direct URL for pdf.js to stream via range requests.
 * No blob fetching — zero UI blocking.
 */

// ─── In-memory URL cache (survives across route navigations) ───
const memoryCache = new Map();
const MAX_MEMORY_ENTRIES = 20;

function setMemoryCache(key, value) {
  // LRU eviction
  if (memoryCache.size >= MAX_MEMORY_ENTRIES) {
    const firstKey = memoryCache.keys().next().value;
    memoryCache.delete(firstKey);
  }
  memoryCache.set(key, value);
}

// ─── Cache API helpers (persistent across browser sessions) ───
const CACHE_NAME = "bhdocs-pdf-meta-v1";

async function getCachedMeta(url) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const resp = await cache.match(url);
    if (resp) {
      return await resp.json();
    }
  } catch {
    // Cache API may not be available (private browsing, etc.)
  }
  return null;
}

async function setCachedMeta(url, meta) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const resp = new Response(JSON.stringify(meta), {
      headers: { "Content-Type": "application/json" },
    });
    await cache.put(url, resp);
  } catch {
    // Silently fail — caching is optional
  }
}

export const usePdfLoader = (fileUrl) => {
  const [pdfSource, setPdfSource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadPhase, setLoadPhase] = useState("init"); // init | resolving | ready | error
  const abortRef = useRef(null);

  useEffect(() => {
    if (!fileUrl) return;

    // ─── Phase 1: Check memory cache (instant) ───
    if (memoryCache.has(fileUrl)) {
      setPdfSource(memoryCache.get(fileUrl));
      setIsLoading(false);
      setLoadPhase("ready");
      return;
    }

    // ─── Phase 2: Resolve PDF URL ───
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      setLoadPhase("resolving");

      try {
        // Check browser cache for meta
        const cachedMeta = await getCachedMeta(fileUrl);
        if (cachedMeta?.resolvedUrl && !controller.signal.aborted) {
          setMemoryCache(fileUrl, cachedMeta.resolvedUrl);
          setPdfSource(cachedMeta.resolvedUrl);
          setIsLoading(false);
          setLoadPhase("ready");
          return;
        }

        // For Vercel Blob/CDN URLs, use the proxy for range request support
        // This ensures proper CORS and caching headers
        const proxyUrl = `/api/pdf?file=${encodeURIComponent(fileUrl)}`;

        // Preflight: verify the URL is reachable with a HEAD request
        // This warms the server-side cache without downloading the file
        const preflight = fetch(proxyUrl, {
          method: "HEAD",
          signal: controller.signal,
        }).catch(() => null); // Non-blocking preflight

        // Don't wait for preflight — set the source immediately
        // pdf.js will handle the actual streaming
        const resolvedUrl = proxyUrl;

        if (!controller.signal.aborted) {
          setMemoryCache(fileUrl, resolvedUrl);
          await setCachedMeta(fileUrl, {
            resolvedUrl,
            timestamp: Date.now(),
          });

          setPdfSource(resolvedUrl);
          setIsLoading(false);
          setLoadPhase("ready");
        }

        // Await preflight silently (warms cache)
        await preflight;
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("[PDF Loader] Error:", err);
          // Fallback: use direct URL
          setPdfSource(fileUrl);
          setIsLoading(false);
          setLoadPhase("ready");
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [fileUrl]);

  return { pdfSource, isLoading, loadPhase };
};