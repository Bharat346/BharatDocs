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

import { useEffect, useState, useRef } from "react";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

export default function PDFViewer({ fileUrl, onClose, isImagePDF = false }) {
  const { theme } = useThemeContext();

  const networkTier = getNetworkTier();
  const memoryTier = getDeviceMemoryTier();

  const renderAhead = 0; // sequential loading for image PDFs
  const rangeChunkSize = networkTier === "fast" ? 262144 : 65536;
  const allowStreaming = networkTier !== "constrained";

  const pageNavPlugin = pageNavigationPlugin();
  const { jumpToNextPage, jumpToPreviousPage, jumpToPage } = pageNavPlugin;

  const zoomPluginInstance = zoomPlugin();
  const { zoomTo } = zoomPluginInstance;

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [showHelp, setShowHelp] = useState(false);

  // Track loaded pages (Set for fast lookup)
  const [loadedPages, setLoadedPages] = useState(new Set());
  const loadedPagesRef = useRef(loadedPages);

  useEffect(() => {
    loadedPagesRef.current = loadedPages;
  }, [loadedPages]);

  /* =========================
     KEYBOARD CONTROLS
  ========================== */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target?.tagName)) return;

      if (e.key === "ArrowDown" || e.key === "j" || e.key === "ArrowRight")
        jumpToNextPage();
      if (e.key === "ArrowUp" || e.key === "k" || e.key === "ArrowLeft")
        jumpToPreviousPage();
      if (e.key === "+" || (e.key === "=" && e.shiftKey)) {
        setScale((prev) => {
          const next = Math.min(prev + 0.1, 3);
          zoomTo(next);
          return next;
        });
      }
      if (e.key === "-") {
        setScale((prev) => {
          const next = Math.max(prev - 0.1, 0.5);
          zoomTo(next);
          return next;
        });
      }
      if (e.key === "f") {
        zoomTo(SpecialZoomLevel.PageFit);
        setScale(1);
      }
      if (e.key === "?") setShowHelp((s) => !s);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jumpToNextPage, jumpToPreviousPage, zoomTo]);

  /* =========================
     SEQUENTIAL PAGE LOADING
  ========================== */
  useEffect(() => {
    if (!fileUrl || totalPages === 0 || !isImagePDF) return;

    let isCancelled = false;

    const loadPagesSequentially = async () => {
      for (let page = 1; page <= totalPages; page++) {
        if (isCancelled) break;

        jumpToPage(page);
        setCurrentPage(page);

        // mark page as loaded
        setTimeout(() => {
          if (!isCancelled) {
            setLoadedPages((prev) => new Set(prev).add(page));
          }
        }, 50);

        await new Promise((res) => setTimeout(res, 20));
      }
    };

    loadPagesSequentially();

    return () => {
      isCancelled = true;
    };
  }, [fileUrl, totalPages, jumpToPage, isImagePDF]);

  /* =========================
     PROGRESSIVE PAGE RENDER
  ========================== */
  const renderPage = ({ canvasLayer, pageIndex }) => {
    const pageNum = pageIndex + 1;

    // Show placeholder for image PDFs if page is not yet loaded
    if (isImagePDF && !loadedPagesRef.current.has(pageNum)) {
      return (
        <div className="absolute inset-0 bg-gray-800/20 flex items-center justify-center pointer-events-none z-10">
          <span className="text-white/50">Loading page {pageNum}...</span>
        </div>
      );
    }

    return canvasLayer; // render the actual page
  };

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
        {fileUrl && (
          <Worker workerUrl="/pdf.worker.min.js">
            <Viewer
              fileUrl={fileUrl}
              plugins={[pageNavPlugin, zoomPluginInstance]}
              defaultScale={SpecialZoomLevel.PageFit}
              theme={theme === "dark" ? "dark" : "light"}
              renderAhead={renderAhead}
              renderPageLayer={renderPage} // progressive loading
              onDocumentLoad={(e) => setTotalPages(e.doc.numPages)}
              onPageChange={(e) => setCurrentPage(e.currentPage)}
              transformGetDocumentParams={(options) => ({
                ...options,
                disableAutoFetch: isImagePDF, // sequential for image PDFs
                disableStream: !allowStreaming,
                rangeChunkSize,
              })}
              style={{ flex: 1 }}
            />
          </Worker>
        )}
      </div>
    </Portal>
  );
}
