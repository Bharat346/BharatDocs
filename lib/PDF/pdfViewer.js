"use client";

import { useEffect, useState } from "react";
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

/* =======================
   IndexedDB setup
======================= */
const DB_NAME = "pdf-cache";
const STORE_NAME = "files";
const EXPIRY_MS = 5 * 24 * 60 * 60 * 1000; // 5 days
const MAX_CACHE_SIZE = 15 * 1024 * 1024; // 15 MB

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

async function getCachedPdf(fileUrl) {
  const db = await getDB();
  const entry = await db.get(STORE_NAME, fileUrl);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > EXPIRY_MS) {
    await db.delete(STORE_NAME, fileUrl);
    return null;
  }
  return entry.blob;
}

async function cachePdf(fileUrl, blob) {
  if (blob.size > MAX_CACHE_SIZE) return;
  const db = await getDB();
  await db.put(STORE_NAME, { blob, timestamp: Date.now() }, fileUrl);
}

/* =======================
   PDF Viewer
======================= */
export default function PDFViewer({
  fileUrl, 
  onClose,
}) {
  const { theme } = useThemeContext();
  const [cachedBlobUrl, setCachedBlobUrl] = useState(null);

  /* Plugins (must be top-level) */
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [],
  });

  const toolbarPluginInstance = toolbarPlugin();

  const transformToolbar = (slot) => ({
    ...slot,
    Download: () => null,
    DownloadMenuItem: () => null,
    Print: () => null,
    PrintMenuItem: () => null,
  });

  /* Load from IndexedDB (if available) */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const cached = await getCachedPdf(fileUrl);
      if (cached && !cancelled) {
        const blobUrl = URL.createObjectURL(cached);
        setCachedBlobUrl(blobUrl);
      }
    })();

    return () => {
      cancelled = true;
      if (cachedBlobUrl) URL.revokeObjectURL(cachedBlobUrl);
    };
  }, [fileUrl]);

  /* Cache AFTER successful load (non-blocking) */
  const handleDocumentLoad = async () => {
    if (cachedBlobUrl) return;

    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      await cachePdf(fileUrl, blob);
      const blobUrl = URL.createObjectURL(blob);
      setCachedBlobUrl(blobUrl);
    } catch {
      // silent fail – CDN already handled display
    }
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[10000] bg-black/90 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="fixed bottom-4 right-4 z-[10001] p-3 rounded-full bg-blue-500/80 hover:bg-blue-500 text-white"
        >
          <X size={24} />
        </button>

        <Worker workerUrl="/pdf.worker.min.js">
          <Viewer
            fileUrl={cachedBlobUrl ?? fileUrl}
            plugins={[defaultLayoutPluginInstance, toolbarPluginInstance]}
            defaultScale={SpecialZoomLevel.PageWidth}
            theme={theme === "dark" ? "dark" : "light"}
            renderToolbar={(slots) =>
              toolbarPluginInstance.renderDefaultToolbar(
                transformToolbar(slots)
              )
            }
            onDocumentLoad={handleDocumentLoad}
          />
        </Worker>
      </div>
    </Portal>
  );
}
