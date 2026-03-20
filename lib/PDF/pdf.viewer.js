"use client";

import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import { searchPlugin } from "@react-pdf-viewer/search";

import { useThemeContext } from "@/components/ThemeProvider";
import PDFHeader from "./pdf.header";
import PDFHelpDialog from "./pdf.help";
import PDFSidebar from "./pdf.sidebar";
import PDFBottomToolbar from "./pdf.bottom-toolbar";
import PDFShare from "./pdf.share";

import { useEffect, useState, useRef, useMemo } from "react";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "@react-pdf-viewer/thumbnail/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";

export default function PDFViewer({ fileUrl, onClose }) {
  const { theme } = useThemeContext();
  const isDark = theme === "dark";

  const CACHE_NAME = "pdf-cache-v3";
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  // CRITICAL: Plugins MUST be memoized. Redefining them on every render 
  // causes the viewer to reload infinitely or flicker.
  const pageNavPluginInstance = pageNavigationPlugin();
  const zoomPluginInstance = zoomPlugin();
  const thumbnailPluginInstance = thumbnailPlugin();
  const searchPluginInstance = searchPlugin();

  const { jumpToNextPage, jumpToPreviousPage, jumpToPage } = pageNavPluginInstance;
  const { zoomTo } = zoomPluginInstance;
  const { Thumbnails } = thumbnailPluginInstance;
  const { activateTab } = searchPluginInstance;

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [pdfSource, setPdfSource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [docTitle, setDocTitle] = useState("Loading...");

  const blobUrlRef = useRef(null);

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
    setDocTitle(decodeURIComponent(name).replace(/-/g, " ").replace(/\.(pdf|doc|docx)$/i, ""));
    return () => window.removeEventListener("resize", checkDevice);
  }, [fileUrl]);

  /* =========================
     KEYBOARD CONTROLS
  ========================== */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target?.tagName)) return;
      
      // Ctrl + Shift + F logic (Search)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "f" || e.key === "F")) {
         e.preventDefault();
         setShowSidebar(true);
         // You might need a timeout or specific search trigger here
      }

      if (e.key === "ArrowRight") { e.preventDefault(); jumpToNextPage(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); jumpToPreviousPage(); }
      if (e.key === "+" || (e.key === "=" && e.shiftKey)) {
        e.preventDefault(); handleZoom(Math.min(scale + 0.1, 3));
      }
      if (e.key === "-") {
        e.preventDefault(); handleZoom(Math.max(scale - 0.1, 0.5));
      }
      if (e.key === "[") setShowSidebar((s) => !s);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jumpToNextPage, jumpToPreviousPage, zoomTo, scale]);

  /* =========================
     PDF LOADING & CACHE
  ========================== */
  useEffect(() => {
    if (!fileUrl) return;
    let cancelled = false;
    setPdfSource(null);
    setIsLoading(true);

    async function loadPdf() {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedRes = await cache.match(fileUrl);
        if (cachedRes) {
          const cachedDate = cachedRes.headers.get("x-cache-date");
          if (cachedDate && Date.now() - new Date(cachedDate).getTime() < SEVEN_DAYS_MS) {
            const blob = await cachedRes.blob();
            const blobUrl = URL.createObjectURL(blob);
            blobUrlRef.current = blobUrl;
            if (!cancelled) setPdfSource(blobUrl);
            return;
          } else { await cache.delete(fileUrl); }
        }
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("PDF fetch failed");
        const blob = await response.blob();
        const headers = new Headers();
        headers.append("x-cache-date", new Date().toISOString());
        await cache.put(fileUrl, new Response(blob, { headers }));
        const blobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = blobUrl;
        if (!cancelled) setPdfSource(blobUrl);
      } catch (err) {
        console.error("[PDF Viewer] Load failed:", err);
        if (!cancelled) setPdfSource(fileUrl);
      }
    }
    loadPdf();
    return () => {
      cancelled = true;
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
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

  const pluginList = useMemo(
    () => [pageNavPluginInstance, zoomPluginInstance, thumbnailPluginInstance, searchPluginInstance],
    [pageNavPluginInstance, zoomPluginInstance, thumbnailPluginInstance, searchPluginInstance],
  );

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col selection:bg-blue-500/30 overflow-hidden ${
      isDark ? "bg-zinc-950" : "bg-gray-100"
    }`}>
      
      {/* 🚀 PERMANENT TOP NAV BAR */}
      <PDFHeader
        title={docTitle}
        onBack={() => window.history.back()}
        onDownload={handleDownload}
        onShare={() => setShowShare(true)}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        theme={theme}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* 📚 SIDEBAR (PREVIEW/THUMBNAILS) */}
        <PDFSidebar
          show={showSidebar && !!pdfSource}
          isDark={isDark}
          isMobile={isMobile}
          onClose={() => setShowSidebar(false)}
          Thumbnails={Thumbnails}
        />

        {/* 📄 MAIN VIEWER & SCROLLABLE AREA */}
        <main className={`flex-1 relative flex flex-col overflow-hidden ${
            isDark ? "bg-zinc-950 text-white" : "bg-gray-200 text-gray-900"
          }`}>
          
          {/* SINGLE REDUCED LOADER LOGIC */}
          {!pdfSource ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Preparing document...</p>
              </div>
            </div>
          ) : (
            <Worker workerUrl="/pdf.worker.min.js">
              <div key={fileUrl} className="flex-1 overflow-auto no-scrollbar">
                <Viewer
                  fileUrl={pdfSource}
                  plugins={pluginList}
                  defaultScale={SpecialZoomLevel.PageFit}
                  theme={isDark ? "dark" : "light"}
                  onDocumentLoad={(e) => {
                    setTotalPages(e.doc.numPages);
                    setDocTitle(e.doc.title || docTitle);
                    setIsLoading(false);
                  }}
                  onPageChange={(e) => setCurrentPage(e.currentPage)}
                  onZoom={(e) => setScale(e.scale)}
                  renderLoader={() => <div className="p-4 text-center text-xs opacity-50">Rendering pages...</div>}
                />
              </div>
            </Worker>
          )}

          {/* 🛠️ FLOATING BOTTOM TOOLBAR (SOLID BG) */}
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

      {showShare && <PDFShare theme={theme} title={docTitle} onClose={() => setShowShare(false)} />}
      {showHelp && <PDFHelpDialog theme={theme} onClose={() => setShowHelp(false)} />}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDark ? "#3f3f46" : "#d4d4d8"}; border-radius: 2px; }
        .rpv-core__viewer { background-color: transparent !important; }
        .rpv-core__inner-pages { background-color: transparent !important; }
        .rpv-core__page-layer { 
           box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
           background-color: transparent !important;
        }
        .rpv-core__inner-page { margin-bottom: 2rem !important; display: block !important; }
        .rpv-core__inner-page:last-child { margin-bottom: 1rem !important; }
        .rpv-thumbnail__container { background-color: transparent !important; }
        .rpv-thumbnail__item--selected { border: 2px solid #3b82f6 !important; border-radius: 8px; }
        .rpv-thumbnail__cover { background-color: ${isDark ? "#18181b" : "#e5e7eb"} !important; border-radius: 4px; overflow: hidden; }
        .rpv-thumbnail__label { color: ${isDark ? "#52525b" : "#71717a"} !important; font-weight: 700 !important; }
        .rpv-core__doc-container { overflow-y: auto !important; height: 100% !important; }
      `}</style>
    </div>
  );
}
