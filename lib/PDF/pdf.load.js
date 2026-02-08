import { useEffect, useRef, useState } from "react";
import { getCachedPdf, cachePdf as cachePdfDB} from "./pdf.cache.js";


function cachePdfBackground(url , blob){
    const ric = window.requestIdleCallback ?? ((cb) => setTimeout(cb,200));
    queueMicrotask(() => {
        ric(async () => {
            try{
                await cachePdfDB(url , blob);
            }
            catch(e){
                console.error("Failed to cache PDF:", e);
            }
        })
    })
}

export function usePdfLoader(fileUrl) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [receivedBytes, setReceivedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);

  const abortRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    let activeBlobUrl = null;

    const loadPdf = async () => {
      try {
        // 1. Check cache
        const cached = await getCachedPdf(fileUrl);
        if (cached) {
          activeBlobUrl = URL.createObjectURL(cached);
          setBlobUrl(activeBlobUrl);
          setLoading(false);
          return;
        }

        // 2️. Fetch PDF from network
        const res = await fetch(fileUrl, { signal: controller.signal });
        const total = Number(res.headers.get("Content-Length") ?? 0);
        setTotalBytes(total);

        const reader = res.body.getReader();
        const chunks = [];
        let received = 0;
        let lastUpdate = performance.now();

        while (true) {
            if(controller.signal.aborted) break;
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          received += value.length;

          //Throttle progress updates
          const now = performance.now();
          if(now - lastUpdate > 50){
            setReceivedBytes(received);
            if(total > 0) setProgress(Math.round((received / total) * 100));
            lastUpdate = now;
          }
        }

        setReceivedBytes(received);
        if(total > 0) setProgress(Math.round((received / total) * 100));

        if(activeBlobUrl) URL.revokeObjectURL(activeBlobUrl);
        const blob = new Blob(chunks, { type: "application/pdf" });
        activeBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(activeBlobUrl);
        setLoading(false);

        cachePdfBackground(fileUrl, blob);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("PDF load failed:", e);
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      controller.abort();
      if (activeBlobUrl) URL.revokeObjectURL(activeBlobUrl);
    };
  }, [fileUrl]);

  return { blobUrl, loading, progress, receivedBytes, totalBytes };
}
