"use client";

import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";

import { useThemeContext } from "@/components/ThemeProvider";
import PDFHeader from "./pdf.header";
import PDFHelpDialog from "./pdf.help";
import PDFSidebar from "./pdf.sidebar";
import PDFBottomToolbar from "./pdf.bottom-toolbar";
import PDFShare from "./pdf.share";

import { usePdfLoader } from "./pdf.loader";
import { usePdfKeyboard } from "./pdf.keys";
import { usePdfPlugins } from "./pdf.plugins";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "@react-pdf-viewer/thumbnail/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";

export default function PDFViewer({ fileUrl, nodeId, onClose, backHref }) {
  const { theme, toggleTheme, mounted } = useThemeContext();
  const isDark = theme === "dark";


  const {
    plugins,
    pageNav: { jumpToNextPage, jumpToPreviousPage, jumpToPage },
    zoom: { zoomTo },
    thumbnail: { Thumbnails },
  } = usePdfPlugins();

  const { pdfSource, isLoading } = usePdfLoader(fileUrl);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [docTitle, setDocTitle] = useState("Loading...");

  const containerRef = useRef(null);

  usePdfKeyboard({
    jumpToNextPage,
    jumpToPreviousPage,
    scale,
    setScale,
    zoomTo,
    toggleSidebar: () => setShowSidebar((s) => !s),
    containerRef,
  });

  /* Detect mobile & update Title from URL */
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setShowSidebar(false);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    const name = fileUrl.split("/").pop()?.split("?")[0] || "document.pdf";
    setDocTitle(
      decodeURIComponent(name)
        .replace(/-/g, " ")
        .replace(/\.(pdf|doc|docx)$/i, ""),
    );
    return () => window.removeEventListener("resize", checkDevice);
  }, [fileUrl]);

  const handleDownload = () => {
    if (!pdfSource) return;
    const link = document.createElement("a");
    link.href = pdfSource;
    link.download = docTitle + ".pdf";
    link.click();
  };

  const handleZoom = (val) => {
    if (typeof val === "number") setScale(val);
    zoomTo(val);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col selection:bg-blue-500/30 overflow-hidden ${
        isDark ? "bg-zinc-950" : "bg-gray-100"
      }`}
    >
      {/* 🚀 PERMANENT TOP NAV BAR */}
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
        {/* 📚 SIDEBAR (PREVIEW/THUMBNAILS) */}
        <PDFSidebar
          show={showSidebar && !!pdfSource}
          isDark={isDark}
          isMobile={isMobile}
          onClose={() => setShowSidebar(false)}
          Thumbnails={Thumbnails}
          nodeId={nodeId}
          fileUrl={fileUrl}
        />

        {/* 📄 MAIN VIEWER & SCROLLABLE AREA */}
        <main
          className={`flex-1 relative flex flex-col overflow-hidden ${
            isDark ? "bg-zinc-950 text-white" : "bg-gray-200 text-gray-900"
          }`}
        >
          {!pdfSource ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                  Preparing document...
                </p>
              </div>
            </div>
          ) : (
            <Worker workerUrl="/pdf.worker.min.js">
              <div
                key={fileUrl}
                className="flex-1 overflow-auto no-scrollbar"
                ref={containerRef}
              >
                <Viewer
                  fileUrl={pdfSource}
                  plugins={plugins}
                  defaultScale={1}
                  theme={isDark ? "dark" : "light"}
                  onDocumentLoad={(e) => {
                    setTotalPages(e.doc.numPages);
                    setDocTitle(e.doc.title || docTitle);
                  }}
                  onPageChange={(e) => setCurrentPage(e.currentPage)}
                  onZoom={(e) => setScale(e.scale)}
                  renderLoader={() => (
                    <div className="p-4 text-center text-xs opacity-50">
                      Rendering pages...
                    </div>
                  )}
                />
              </div>
            </Worker>
          )}

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
        </main>
      </div>

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
