"use client";

import { X, Download } from "lucide-react";
import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin } from "@react-pdf-viewer/zoom";

import { useThemeContext } from "@/components/ThemeProvider";
import Portal from "@/components/Portal";
import PDFToolbar from "./pdf.toolbar";
import PDFHelpDialog from "./pdf.help";

import { useEffect, useState, useMemo, useRef } from "react";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

export default function PDFViewer({ fileUrl, onClose }) {
  const { theme } = useThemeContext();

  const CACHE_NAME = "pdf-cache-v2";
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  const pageNavPluginInstance = pageNavigationPlugin();
  const { jumpToNextPage, jumpToPreviousPage, jumpToPage } =
    pageNavPluginInstance;

  const zoomPluginInstance = zoomPlugin();
  const { zoomTo } = zoomPluginInstance;

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [pdfSource, setPdfSource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const blobUrlRef = useRef(null);

  /* =========================
     KEYBOARD CONTROLS
  ========================== */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target?.tagName)) return;

      if (["ArrowDown", "j", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        jumpToNextPage();
      }

      if (["ArrowUp", "k", "ArrowLeft"].includes(e.key)) {
        e.preventDefault();
        jumpToPreviousPage();
      }

      if (e.key === "+" || (e.key === "=" && e.shiftKey)) {
        e.preventDefault();
        setScale((prev) => {
          const next = Math.min(prev + 0.1, 3);
          zoomTo(next);
          return next;
        });
      }

      if (e.key === "-") {
        e.preventDefault();
        setScale((prev) => {
          const next = Math.max(prev - 0.1, 0.5);
          zoomTo(next);
          return next;
        });
      }

      if (e.key === "f") {
        e.preventDefault();
        zoomTo(SpecialZoomLevel.PageFit);
        setScale(1);
      }

      if (e.key === "?") {
        e.preventDefault();
        setShowHelp((s) => !s);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jumpToNextPage, jumpToPreviousPage, zoomTo]);

  /* =========================
     TRUE 7-DAY CACHE STRATEGY
  ========================== */
  useEffect(() => {
    if (!fileUrl) return;

    let cancelled = false;

    async function loadPdf() {
      setIsLoading(true);

      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(fileUrl);

        if (cachedResponse) {
          const cachedDate = cachedResponse.headers.get("x-cache-date");

          if (
            cachedDate &&
            Date.now() - new Date(cachedDate).getTime() < SEVEN_DAYS_MS
          ) {
            const blob = await cachedResponse.blob();
            const blobUrl = URL.createObjectURL(blob);
            blobUrlRef.current = blobUrl;

            if (!cancelled) {
              setPdfSource(blobUrl);
              setIsLoading(false);
            }

            return;
          } else {
            await cache.delete(fileUrl);
          }
        }

        // Download once
        const response = await fetch(fileUrl);

        if (!response.ok) throw new Error("PDF fetch failed");

        const blob = await response.blob();

        const headers = new Headers();
        headers.append("x-cache-date", new Date().toISOString());

        await cache.put(
          fileUrl,
          new Response(blob, {
            headers,
          })
        );

        const blobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = blobUrl;

        if (!cancelled) {
          setPdfSource(blobUrl);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[PDF Viewer] Cache load failed:", err);
        setPdfSource(fileUrl); // fallback
        setIsLoading(false);
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, [fileUrl]);

  /* =========================
     VIEWER CONFIG (NO STREAMING)
  ========================== */
  const getDocumentParams = useMemo(
    () => (options) => ({
      ...options,
      disableStream: false,
      disableAutoFetch: false,
      rangeChunkSize: 262144, // 256KB good balance
      stopAtErrors: false,
    }),
    []
  );

  const handleDownload = () => {
    if (!pdfSource) return;
    const link = document.createElement("a");
    link.href = pdfSource;
    link.download = fileUrl.split("/").pop() || "document.pdf";
    link.click();
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[10000] bg-black/90 flex flex-col">

        {/* Floating Buttons */}
        <div className="fixed bottom-20 right-4 z-[10001] flex flex-col space-y-2">
          <button
            onClick={handleDownload}
            className="p-3 rounded-full bg-green-500/80 hover:bg-green-500 text-white shadow-xl"
          >
            <Download size={22} />
          </button>
          <button
            onClick={onClose}
            className="p-3 rounded-full bg-blue-500/80 hover:bg-blue-500 text-white shadow-xl"
          >
            <X size={22} />
          </button>
        </div>

        <PDFToolbar
          currentPage={currentPage}
          totalPages={totalPages}
          scale={scale}
          onZoomChange={(value) => {
            setScale(value);
            zoomTo(value);
          }}
          onFit={() => {
            zoomTo(SpecialZoomLevel.PageFit);
            setScale(1);
          }}
          onHelp={() => setShowHelp(true)}
          onJumpToPage={(pageIndex) => jumpToPage(pageIndex)}
          theme={theme}
        />

        {showHelp && <PDFHelpDialog onClose={() => setShowHelp(false)} />}

        {pdfSource && (
          <Worker workerUrl="/pdf.worker.min.js">
            <Viewer
              fileUrl={pdfSource}
              plugins={[pageNavPluginInstance, zoomPluginInstance]}
              defaultScale={SpecialZoomLevel.PageFit}
              theme={theme === "dark" ? "dark" : "light"}
              onDocumentLoad={(e) => setTotalPages(e.doc.numPages)}
              onPageChange={(e) => setCurrentPage(e.currentPage)}
              transformGetDocumentParams={getDocumentParams}
              style={{ flex: 1 }}
            />
          </Worker>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="text-white font-mono text-sm animate-pulse">
              Loading PDF...
            </div>
          </div>
        )}
      </div>
    </Portal>
  );
}
