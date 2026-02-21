"use client";

import { X, Download } from "lucide-react";
import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin } from "@react-pdf-viewer/zoom";

import { useThemeContext } from "@/components/ThemeProvider";
import Portal from "@/components/Portal";
import PDFToolbar from "./pdf.toolbar";
import PDFHelpDialog from "./pdf.help";

import {
  getNetworkTier,
  getDeviceMemoryTier,
} from "@/lib/network/network.config";

import { useEffect, useState, useMemo } from "react";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

export default function PDFViewer({ fileUrl, onClose, isImagePDF = false }) {
  const { theme } = useThemeContext();

  const networkTier = getNetworkTier();
  const memoryTier = getDeviceMemoryTier();

  const renderAhead = 10; // Balanced for speed and memory stability
  const rangeChunkSize = networkTier === "fast" ? 1048576 : 262144;
  const allowStreaming = networkTier !== "constrained";

  const pageNavPluginInstance = pageNavigationPlugin();
  const { jumpToNextPage, jumpToPreviousPage, jumpToPage } =
    pageNavPluginInstance;

  const zoomPluginInstance = zoomPlugin();
  const { zoomTo } = zoomPluginInstance;

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [showHelp, setShowHelp] = useState(false);

  /* =========================
     KEYBOARD CONTROLS
  ========================== */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in the page input
      if (["INPUT", "TEXTAREA"].includes(e.target?.tagName)) return;

      // Navigation
      if (e.key === "ArrowDown" || e.key === "j" || e.key === "ArrowRight") {
        e.preventDefault();
        jumpToNextPage();
      }
      if (e.key === "ArrowUp" || e.key === "k" || e.key === "ArrowLeft") {
        e.preventDefault();
        jumpToPreviousPage();
      }

      // Zooming
      if (e.key === "+" || (e.key === "=" && (e.shiftKey || e.ctrlKey))) {
        e.preventDefault();
        setScale((prev) => {
          const next = Math.min(prev + 0.1, 3);
          zoomTo(next);
          return next;
        });
      }
      if (e.key === "-" || (e.key === "-" && e.ctrlKey)) {
        e.preventDefault();
        setScale((prev) => {
          const next = Math.max(prev - 0.1, 0.5);
          zoomTo(next);
          return next;
        });
      }

      // Fit to screen
      if (e.key === "f") {
        e.preventDefault();
        zoomTo(SpecialZoomLevel.PageFit);
        setScale(1);
      }

      // Help
      if (e.key === "?") {
        e.preventDefault();
        setShowHelp((s) => !s);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jumpToNextPage, jumpToPreviousPage, zoomTo]);

  /* =========================
     DOWNLOAD HANDLER
  ========================== */
  const handleDownload = () => {
    if (!fileUrl) return;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileUrl.split("/").pop() || "document.pdf";
    link.click();
  };

  const getDocumentParams = useMemo(
    () => (options) => ({
      ...options,
      disableAutoFetch: false,
      disableStream: !allowStreaming,
      rangeChunkSize,
    }),
    [allowStreaming, rangeChunkSize],
  );

  /* =========================
     CACHING STRATEGY
  ========================== */
  const processedFileUrl = useMemo(() => {
    if (!fileUrl) return null;
    // If it's a CDN link (starts with http), use our server-side cache proxy
    // This enables the 7-day server-side caching strategy defined in /api/pdf
    if (fileUrl.startsWith("http")) {
      return `/api/pdf?file=${encodeURIComponent(fileUrl)}`;
    }
    return fileUrl;
  }, [fileUrl]);

  /* =========================
     RENDER
  ========================== */
  return (
    <Portal>
      <div className="fixed inset-0 z-[10000] bg-black/90 flex flex-col">
        {/* Close & Download Buttons */}
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

        {/* Toolbar */}
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

        {/* Help Dialog */}
        {showHelp && <PDFHelpDialog onClose={() => setShowHelp(false)} />}

        {/* Viewer */}
        {processedFileUrl && (
          <Worker workerUrl="/pdf.worker.min.js">
            <Viewer
              fileUrl={processedFileUrl}
              plugins={[pageNavPluginInstance, zoomPluginInstance]}
              defaultScale={SpecialZoomLevel.PageFit}
              theme={theme === "dark" ? "dark" : "light"}
              renderAhead={renderAhead}
              onDocumentLoad={(e) => setTotalPages(e.doc.numPages)}
              onPageChange={(e) => setCurrentPage(e.currentPage)}
              transformGetDocumentParams={getDocumentParams}
              style={{ flex: 1 }}
            />
          </Worker>
        )}
      </div>
    </Portal>
  );
}
