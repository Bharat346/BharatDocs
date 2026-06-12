import { useEffect, useState, useRef } from "react";
import { getFromCache, setToCache, STORES } from "@/lib/idb.cache";

// ─── In-memory URL cache (survives across route navigations) ───
const memoryCache = new Map();
const MAX_MEMORY_ENTRIES = 7;

function setMemoryCache(key, value) {
  if (memoryCache.size >= MAX_MEMORY_ENTRIES) {
    const firstKey = memoryCache.keys().next().value;
    memoryCache.delete(firstKey);
  }
  memoryCache.set(key, value);
}

export const usePdfLoader = (fileUrl) => {
  const [pdfSource, setPdfSource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadPhase, setLoadPhase] = useState("init");
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

    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      setLoadPhase("resolving");

      try {
        // ─── Phase 2: Check IndexedDB Cache ───
        const cachedBlob = await getFromCache(STORES.PDF, fileUrl);
        if (cachedBlob && !controller.signal.aborted) {
          const objectUrl = URL.createObjectURL(cachedBlob);
          setMemoryCache(fileUrl, objectUrl);
          setPdfSource(objectUrl);
          setIsLoading(false);
          setLoadPhase("ready");
          return;
        }

        // ─── Phase 3: Fetch and Cache Blob ───
        const proxyUrl = `/api/pdf?file=${encodeURIComponent(fileUrl)}`;
        const response = await fetch(proxyUrl, { signal: controller.signal });
        
        if (!response.ok) throw new Error("Failed to fetch PDF");
        
        const blob = await response.blob();
        
        if (!controller.signal.aborted) {
          // Store asynchronously in IDB
          setToCache(STORES.PDF, fileUrl, blob);
          
          const objectUrl = URL.createObjectURL(blob);
          setMemoryCache(fileUrl, objectUrl);
          setPdfSource(objectUrl);
          setIsLoading(false);
          setLoadPhase("ready");
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("[PDF Loader] Error:", err);
          // Fallback: use direct URL streaming
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