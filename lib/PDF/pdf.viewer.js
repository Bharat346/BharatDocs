"use client";

import { X } from "lucide-react";
import { Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin } from "@react-pdf-viewer/zoom";

import { useThemeContext } from "@/components/ThemeProvider";
import Portal from "@/components/Portal";
import PDFToolbar from "./pdf.toolbar";
import PDFHelpDialog from "./pdf.help";

import {
  getNetworkTier,
  shouldPrefetch,
  getDeviceMemoryTier,
} from "@/lib/network/network.config";

import { initPdfWorkerIdle } from "@/lib/PDF/worker";

import { useEffect, useState } from "react";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

export default function PDFViewer({ fileUrl, onClose }) {
  const { theme } = useThemeContext();

  /* =========================
     INIT GLOBAL WORKER (ONCE)
  ========================== */

  useEffect(() => {
    initPdfWorkerIdle();
  }, []);

  /* =========================
     NETWORK ADAPTIVE SETTINGS
  ========================== */

  const networkTier = getNetworkTier();
  const memoryTier = getDeviceMemoryTier();

  const renderAhead =
    networkTier === "fast"
      ? memoryTier === "high"
        ? 4
        : 2
      : networkTier === "moderate"
        ? 1
        : 0;

  const rangeChunkSize = networkTier === "fast" ? 262144 : 65536;

  const allowStreaming = networkTier !== "constrained";

  /* =========================
     PLUGINS
  ========================== */

  const pageNavPlugin = pageNavigationPlugin();
  const { jumpToNextPage, jumpToPreviousPage, jumpToPage } = pageNavPlugin;

  const zoomPluginInstance = zoomPlugin();
  const { zoomTo } = zoomPluginInstance;

  /* =========================
     STATE
  ========================== */

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [showHelp, setShowHelp] = useState(false);

  /* =========================
     KEYBOARD CONTROLS
  ========================== */

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target?.tagName)) return;

      // Navigation
      if (e.key === "ArrowDown" || e.key === "j" || e.key === "ArrowRight")
        jumpToNextPage();

      if (e.key === "ArrowUp" || e.key === "k" || e.key === "ArrowLeft")
        jumpToPreviousPage();

      // Zoom in
      if (e.key === "+" || (e.key === "=" && e.shiftKey)) {
        setScale((prev) => {
          const next = Math.min(prev + 0.1, 3);
          zoomTo(next);
          return next;
        });
      }

      // Zoom out
      if (e.key === "-") {
        setScale((prev) => {
          const next = Math.max(prev - 0.1, 0.5);
          zoomTo(next);
          return next;
        });
      }

      // Fit page
      if (e.key === "f") {
        zoomTo(SpecialZoomLevel.PageFit);
        setScale(1);
      }

      // Help
      if (e.key === "?") {
        setShowHelp((s) => !s);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jumpToNextPage, jumpToPreviousPage, zoomTo]);

  /* =========================
     RENDER
  ========================== */

  return (
    <Portal>
      <div className="fixed inset-0 z-[10000] bg-black/90 flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="fixed bottom-4 right-4 z-[10001] p-3 rounded-full bg-blue-500/80 hover:bg-blue-500 text-white shadow-xl"
        >
          <X size={22} />
        </button>

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
        {fileUrl && (
          <Viewer
            fileUrl={fileUrl}
            plugins={[pageNavPlugin, zoomPluginInstance]}
            defaultScale={SpecialZoomLevel.PageFit}
            theme={theme === "dark" ? "dark" : "light"}
            renderAhead={renderAhead}
            enableSmoothScroll={networkTier !== "constrained"}
            onDocumentLoad={(e) => setTotalPages(e.doc.numPages)}
            onPageChange={(e) => setCurrentPage(e.currentPage)}
            transformGetDocumentParams={(options) => ({
              ...options,
              disableAutoFetch: !shouldPrefetch(),
              disableStream: !allowStreaming,
              rangeChunkSize,
            })}
            style={{ flex: 1 }}
          />
        )}
      </div>
    </Portal>
  );
}
