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

// IndexedDB setup
const DB_NAME = "pdf-cache";
const STORE_NAME = "files";
const EXPIRY_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME);
        store.createIndex("timestamp", "timestamp");
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
  const db = await getDB();
  await db.put(STORE_NAME, { blob, timestamp: Date.now() }, fileUrl);
}

export default function PDFViewer({ fileUrl, onClose }) {
  const { theme } = useThemeContext();
  const [cachedBlobUrl, setCachedBlobUrl] = useState(null);

  // --- Plugins MUST be initialized at top level ---
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [], // hide sidebar
  });

  const toolbarPluginInstance = toolbarPlugin();

  // Hide Download and Print completely (buttons + menu items)
  const transformToolbar = (slot) => ({
    ...slot,
    Download: () => <></>,
    DownloadMenuItem: () => <></>,
    Print: () => <></>,
    PrintMenuItem: () => <></>,
  });

  useEffect(() => {
    let cancelled = false;

    async function prepareCache() {
      const apiUrl = `/api/pdf?file=${encodeURIComponent(fileUrl)}`;
      const cachedBlob = await getCachedPdf(apiUrl);

      if (cachedBlob && !cancelled) {
        const blobUrl = URL.createObjectURL(cachedBlob);
        setCachedBlobUrl(blobUrl);
      }
    }

    prepareCache().catch(console.error);

    return () => {
      cancelled = true;
      if (cachedBlobUrl) URL.revokeObjectURL(cachedBlobUrl);
    };
  }, [fileUrl]);

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[10000] bg-black/90 flex flex-col items-center justify-start"
        role="dialog"
        aria-modal="true"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="fixed bottom-4 right-4 z-[10001] p-3 rounded-full bg-blue-500/80 hover:bg-blue-500 text-white"
        >
          <X size={24} />
        </button>

        <Worker workerUrl="/pdf.worker.min.js">
          <Viewer
            // If cached, use blob URL; else fallback to API URL (automatic fetch)
            fileUrl={
              cachedBlobUrl
                ? cachedBlobUrl
                : `/api/pdf?file=${encodeURIComponent(fileUrl)}`
            }
            plugins={[defaultLayoutPluginInstance, toolbarPluginInstance]}
            defaultScale={SpecialZoomLevel.PageFit}
            theme={theme === "dark" ? "dark" : "light"}
            renderToolbar={(slots) =>
              toolbarPluginInstance.renderDefaultToolbar(transformToolbar(slots))
            }
            // Optional: automatically cache after PDF.js loads the file
            onDocumentLoad={async (doc) => {
              if (!cachedBlobUrl) {
                try {
                  const apiUrl = `/api/pdf?file=${encodeURIComponent(fileUrl)}`;
                  const res = await fetch(apiUrl);
                  const blob = await res.blob();
                  await cachePdf(apiUrl, blob);
                  const blobUrl = URL.createObjectURL(blob);
                  setCachedBlobUrl(blobUrl);
                } catch (err) {
                  console.error("Failed to cache PDF:", err);
                }
              }
            }}
          />
        </Worker>
      </div>
    </Portal>
  );
}
