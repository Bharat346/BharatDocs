"use client";

import { useThemeContext } from "@/components/ThemeProvider";
import PDFHeader from "./pdf.header";
import PDFHelpDialog from "./pdf.help";
import PDFBottomToolbar from "./pdf.bottom-toolbar";
import PDFShare from "./pdf.share";
import PDFUniversalLoader from "@/components/PDFViewerPage/PDFUniversalLoader";
import { usePdfLoader } from "./pdf.loader";
import GPUPDFViewer from "./gpu/GPUPDFViewer";

import { useEffect, useState, useRef, useCallback } from "react";

export default function PDFViewer({
  fileUrl,
  nodeId,
  docTitle: initialTitle,
  onClose,
  backHref,
}) {
  const { theme, toggleTheme, mounted } = useThemeContext();
  const isDark = theme === "dark";

  const { pdfSource, isLoading: urlLoading, loadPhase } = usePdfLoader(fileUrl);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [docTitle, setDocTitle] = useState(initialTitle || "Loading...");
  const [viewerReady, setViewerReady] = useState(false);

  // Imperative ref for GPU viewer controls
  const controlRef = useRef(null);

  /* Detect mobile & derive title from URL if not provided */
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);

    if (!initialTitle && fileUrl) {
      const name = fileUrl.split("/").pop()?.split("?")[0] || "document.pdf";
      setDocTitle(
        decodeURIComponent(name)
          .replace(/-/g, " ")
          .replace(/\.(pdf|doc|docx)$/i, ""),
      );
    }

    return () => window.removeEventListener("resize", checkDevice);
  }, [fileUrl, initialTitle]);

  const handleDownload = useCallback(() => {
    if (!fileUrl) return;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = (docTitle || "document") + ".pdf";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [fileUrl, docTitle]);

  const handleZoom = useCallback((val) => {
    if (typeof val === "number") {
      setScale(val);
      controlRef.current?.zoomTo(val);
    }
  }, []);

  // ── Keyboard shortcuts for zoom & navigation ───────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target?.tagName)) return;

      // Keyboard shortcuts for zoom
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoom(Math.min(scale + 0.15, 5));
        return;
      } else if (e.key === "-") {
        e.preventDefault();
        handleZoom(Math.max(scale - 0.15, 0.25));
        return;
      } else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        handleZoom(1);
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        controlRef.current?.jumpToNextPage();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        controlRef.current?.jumpToPreviousPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scale, handleZoom]);



  // Loading pipeline steps
  const getPipelineStep = () => {
    if (viewerReady) return 3;
    switch (loadPhase) {
      case "init": return 1;
      case "resolving": return 2;
      default: return 2;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col selection:bg-blue-500/30 overflow-hidden ${
        isDark ? "bg-zinc-950" : "bg-gray-100"
      }`}
    >
      {/* TOP NAV BAR */}
      <PDFHeader
        title={docTitle}
        backHref={backHref}
        onDownload={handleDownload}
        onShare={() => setShowShare(true)}
        onToggleSidebar={() => {}}
        theme={theme}
        toggleTheme={toggleTheme}
        mounted={mounted}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* MAIN VIEWER */}
        <main
          id="gpu-pdf-container"
          className={`flex-1 relative flex flex-col overflow-hidden ${
            isDark ? "bg-zinc-950 text-white" : "bg-gray-200 text-gray-900"
          }`}
        >
          {pdfSource && (
            <GPUPDFViewer
              pdfUrl={pdfSource}
              isDark={isDark}
              controlRef={controlRef}
              onDocumentLoad={({ numPages }) => {
                setTotalPages(numPages);
                setViewerReady(true);
              }}
              onPageChange={(page) => setCurrentPage(page)}
              onScaleChange={(s) => setScale(s)}
            />
          )}

          {(!pdfSource || !viewerReady) && (
            <PDFUniversalLoader pipeline={getPipelineStep()} />
          )}

          {/* Bottom Toolbar — only when viewer ready */}
          {viewerReady && (
            <PDFBottomToolbar
              isDark={isDark}
              currentPage={currentPage - 1}
              totalPages={totalPages}
              scale={scale}
              onPreviousPage={() => controlRef.current?.jumpToPreviousPage()}
              onNextPage={() => controlRef.current?.jumpToNextPage()}
              onJumpToPage={(index) => controlRef.current?.jumpToPage(index + 1)}
              onZoomIn={() => handleZoom(Math.min(scale + 0.15, 5))}
              onZoomOut={() => handleZoom(Math.max(scale - 0.15, 0.25))}
              onZoomFit={() => handleZoom(1)}
              onHelp={() => setShowHelp(true)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {showShare && (
        <PDFShare
          theme={theme}
          title={docTitle}
          onClose={() => setShowShare(false)}
        />
      )}
      {showHelp && (
        <PDFHelpDialog theme={theme} onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
}
