"use client";

import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";

import { useThemeContext } from "@/components/ThemeProvider";
import PDFHeader from "./pdf.header";
import PDFHelpDialog from "./pdf.help";
import PDFSidebar from "./pdf.sidebar";
import PDFBottomToolbar from "./pdf.bottom-toolbar";
import PDFShare from "./pdf.share";
import PDFUniversalLoader from "@/components/PDFViewerPage/PDFUniversalLoader";

import { usePdfLoader } from "./pdf.loader";
import { usePdfKeyboard } from "./pdf.keys";
import { usePdfPlugins } from "./pdf.plugins";

import { useEffect, useState, useRef, useCallback } from "react";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "@react-pdf-viewer/thumbnail/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";

export default function PDFViewer({
  fileUrl,
  nodeId,
  docTitle: initialTitle,
  onClose,
  backHref,
}) {
  const { theme, toggleTheme, mounted } = useThemeContext();
  const isDark = theme === "dark";

  const {
    plugins,
    pageNav: { jumpToNextPage, jumpToPreviousPage, jumpToPage },
    zoom: { zoomTo },
    thumbnail: { Thumbnails },
  } = usePdfPlugins();

  const { pdfSource, isLoading, loadPhase } = usePdfLoader(fileUrl);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [docTitle, setDocTitle] = useState(initialTitle || "Loading...");
  const [viewerReady, setViewerReady] = useState(false);

  const containerRef = useRef(null);

  usePdfKeyboard({
    jumpToNextPage,
    jumpToPreviousPage,
    scale,
    setScale,
    zoomTo,
    toggleSidebar: () => setShowSidebar((s) => !s),
    onSearchOpen: () => {}, // handled by header search
    containerRef,
  });

  /* Detect mobile & derive title from URL if not provided */
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setShowSidebar(false);
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

  const handleZoom = useCallback(
    (val) => {
      if (typeof val === "number") setScale(val);
      zoomTo(val);
    },
    [zoomTo],
  );

  // Loading pipeline steps
  const getPipelineStep = () => {
    if (viewerReady) return 3;
    switch (loadPhase) {
      case "init":
        return 1;
      case "resolving":
        return 2;
      default:
        return 2;
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
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        theme={theme}
        toggleTheme={toggleTheme}
        mounted={mounted}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR REMOVED FOR FASTER PREVIEW & MINIMALISM */}

        {/* MAIN VIEWER */}
        <main
          className={`flex-1 relative flex flex-col overflow-hidden ${
            isDark ? "bg-zinc-950 text-white" : "bg-gray-200 text-gray-900"
          }`}
        >
          {pdfSource && (
            <Worker workerUrl="/pdf.worker.min.js">
              <div
                key={fileUrl}
                className={`flex-1 overflow-auto no-scrollbar ${
                  isDark ? "pdf-dark-mode" : ""
                }`}
                ref={containerRef}
              >
                <Viewer
                  fileUrl={pdfSource}
                  plugins={plugins}
                  defaultScale={SpecialZoomLevel.PageFit}
                  theme={isDark ? "dark" : "light"}
                  enablePrint={false}
                  onDocumentLoad={(e) => {
                    setTotalPages(e.doc.numPages);
                    if (e.doc.title) setDocTitle(e.doc.title);
                    setViewerReady(true);
                  }}
                  onPageChange={(e) => setCurrentPage(e.currentPage)}
                  onZoom={(e) => setScale(e.scale)}
                  renderMode="canvas"
                  renderLoader={() => null}
                />
              </div>
            </Worker>
          )}

          {(!pdfSource || !viewerReady) && (
            <PDFUniversalLoader pipeline={getPipelineStep()} />
          )}

          {/* Bottom Toolbar — only when viewer ready */}
          {viewerReady && (
            <PDFBottomToolbar
              isDark={isDark}
              currentPage={currentPage}
              totalPages={totalPages}
              scale={scale}
              onPreviousPage={() => jumpToPreviousPage()}
              onNextPage={() => jumpToNextPage()}
              onJumpToPage={(index) => jumpToPage(index)}
              onZoomIn={() => handleZoom(Math.min(scale + 0.1, 3))}
              onZoomOut={() => handleZoom(Math.max(scale - 0.1, 0.5))}
              onZoomFit={() => handleZoom(SpecialZoomLevel.PageFit)}
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
