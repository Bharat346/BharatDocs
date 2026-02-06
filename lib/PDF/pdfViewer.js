"use client";

import { useEffect, useRef, useState } from "react";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/toolbar/lib/styles/index.css";

import { X } from "lucide-react";
import { useThemeContext } from "@/components/ThemeProvider";
import Portal from "@/components/Portal";
import { openDB } from "idb";

import "@/lib/PDF/pdf.config";

/* =======================
   IndexedDB Cache
======================= */
const DB_NAME = "pdf-cache";
const STORE_NAME = "files";
const EXPIRY_MS = 5 * 24 * 60 * 60 * 1000;

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

async function getCachedPdf(url) {
  const db = await getDB();
  const entry = await db.get(STORE_NAME, url);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > EXPIRY_MS) {
    await db.delete(STORE_NAME, url);
    return null;
  }
  return entry.blob;
}

async function cachePdf(url, blob) {
  const db = await getDB();
  await db.put(STORE_NAME, { blob, timestamp: Date.now() }, url);
}

/* =======================
   Utils
======================= */
function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/* =======================
   PDF Viewer
======================= */
export default function PDFViewer({ fileUrl, onClose }) {
  const { theme } = useThemeContext();

  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const [progress, setProgress] = useState(0);
  const [receivedBytes, setReceivedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);

  const abortRef = useRef(null);

  /* Plugins */
  const layoutPlugin = defaultLayoutPlugin({
    sidebarTabs: () => [],
  });

  const toolbarPluginInstance = toolbarPlugin();

  const transformToolbar = (slots) => ({
    ...slots,
    Download: () => null,
    DownloadMenuItem: () => null,
    Print: () => null,
    PrintMenuItem: () => null,
  });

  /* =======================
     LOAD PDF (Streaming)
  ======================= */
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    let activeBlobUrl = null;

    (async () => {
      try {
        /* 1️⃣ Cache */
        const cached = await getCachedPdf(fileUrl);
        if (cached) {
          activeBlobUrl = URL.createObjectURL(cached);
          setBlobUrl(activeBlobUrl);
          setLoading(false);
          return;
        }

        /* 2️⃣ Stream download */
        const res = await fetch(fileUrl, { signal: controller.signal });

        const lengthHeader = res.headers.get("Content-Length");
        const total = lengthHeader ? Number(lengthHeader) : 0;
        setTotalBytes(total);

        const reader = res.body.getReader();
        const chunks = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          received += value.length;

          setReceivedBytes(received);

          if (total) {
            setProgress(Math.round((received / total) * 100));
          }
        }

        const blob = new Blob(chunks, { type: "application/pdf" });
        activeBlobUrl = URL.createObjectURL(blob);

        setBlobUrl(activeBlobUrl);
        setLoading(false);

        cachePdf(fileUrl, blob).catch(() => {});
      } catch {
        setLoading(false);
      }
    })();

    return () => {
      controller.abort();
      if (activeBlobUrl) URL.revokeObjectURL(activeBlobUrl);
    };
  }, [fileUrl]);

  return (
    <Portal>
      <div className="fixed inset-0 z-[10000] bg-black/90 flex flex-col">
        {/* Close */}
        <button
          onClick={onClose}
          className="fixed bottom-4 right-4 z-[10001]
                     p-3 rounded-full bg-blue-500/80
                     hover:bg-blue-500 text-white
                     shadow-xl backdrop-blur"
        >
          <X size={22} />
        </button>

        {/* ===== Loader ===== */}
        {loading && (
          <div className="absolute inset-0 z-[10002] flex items-center justify-center">
            <div
              className="w-[320px] rounded-2xl bg-black/60 backdrop-blur-xl
                            border border-white/10 shadow-2xl p-6 text-center"
            >
              <div className="text-sm tracking-widest text-blue-400 mb-4">
                LOADING PDF
              </div>

              {/* Progress bar */}
              <div className="relative h-2 rounded-full overflow-hidden bg-white/10">
                {totalBytes ? (
                  <div
                    className="absolute inset-y-0 left-0
                               bg-gradient-to-r from-blue-400 to-cyan-400
                               transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                ) : (
                  <div
                    className="absolute inset-y-0 w-1/3
                               bg-gradient-to-r from-transparent via-blue-400 to-transparent
                               animate-[loading_1.2s_linear_infinite]"
                  />
                )}
              </div>

              {/* Text */}
              <div className="mt-4 text-xs text-blue-300 font-mono">
                {totalBytes ? (
                  <>
                    {progress}% • {formatBytes(receivedBytes)} /{" "}
                    {formatBytes(totalBytes)}
                  </>
                ) : (
                  <>Downloaded {formatBytes(receivedBytes)}</>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== Viewer ===== */}
        <Worker workerUrl="/pdf.worker.min.js">
          {!loading && blobUrl && (
            <Viewer
              key={blobUrl}
              fileUrl={blobUrl}
              plugins={[layoutPlugin, toolbarPluginInstance]}
              defaultScale={SpecialZoomLevel.PageWidth}
              theme={theme === "dark" ? "dark" : "light"}
            />
          )}
        </Worker>
      </div>
    </Portal>
  );
}
