import { useEffect, useRef, useState } from "react";

export const usePdfLoader = (fileUrl) => {
  const CACHE_NAME = "pdf-cache-v3";
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  const [pdfSource, setPdfSource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const blobUrlRef = useRef(null);

  useEffect(() => {
    if (!fileUrl) return;

    let cancelled = false;
    setPdfSource(null);
    setIsLoading(true);

    const loadPdf = async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedRes = await cache.match(fileUrl);

        if (cachedRes) {
          const cachedDate = cachedRes.headers.get("x-cache-date");

          if (
            cachedDate &&
            Date.now() - new Date(cachedDate).getTime() < SEVEN_DAYS_MS
          ) {
            const blob = await cachedRes.blob();
            const url = URL.createObjectURL(blob);
            blobUrlRef.current = url;

            if (!cancelled) setPdfSource(url);
            return;
          } else {
            await cache.delete(fileUrl);
          }
        }

        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error("Fetch failed");

        const blob = await res.blob();

        const headers = new Headers();
        headers.append("x-cache-date", new Date().toISOString());

        await cache.put(fileUrl, new Response(blob, { headers }));

        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;

        if (!cancelled) setPdfSource(url);
      } catch (err) {
        console.error(err);
        if (!cancelled) setPdfSource(fileUrl);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, [fileUrl]);

  return { pdfSource, isLoading };
};