"use client";

import { X } from "lucide-react";
import { useRef } from "react";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";

import Portal from "@/components/Portal";
import { useThemeContext } from "@/components/ThemeProvider";
import ProgressLoader from "./pdf.progressLoader";
import { usePdfLoader } from "./pdf.load";
import "@/lib/PDF/pdf.config";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/toolbar/lib/styles/index.css";

export default function PDFViewer({ fileUrl, onClose }) {
  const { theme } = useThemeContext();
  const { blobUrl, loading, progress, receivedBytes, totalBytes } =
    usePdfLoader(fileUrl);

  const layoutPlugin = defaultLayoutPlugin({ sidebarTabs: () => [] });
  const toolbarPluginInstance = toolbarPlugin();

  const viewerRef = useRef(null);

  return (
    <Portal>
      <div className="fixed inset-0 z-[10000] bg-black/90 flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="fixed bottom-4 right-4 z-[10001] p-3 rounded-full bg-blue-500/80 hover:bg-blue-500 text-white shadow-xl backdrop-blur"
        >
          <X size={22} />
        </button>

        {/* Loader for first-page only */}
        {loading && (
          <ProgressLoader
            progress={progress}
            receivedBytes={receivedBytes}
            totalBytes={totalBytes}
          />
        )}

        {/* PDF Viewer */}
        {blobUrl && (
          <Worker workerUrl="/pdf.worker.min.js">
            <Viewer
              ref={viewerRef}
              key={blobUrl}
              fileUrl={blobUrl}
              plugins={[layoutPlugin, toolbarPluginInstance]}
              defaultScale={SpecialZoomLevel.PageWidth}
              theme={theme === "dark" ? "dark" : "light"}
              enableSmoothScroll
              renderAhead={1} // only first page pre-rendered
              initialPage={0}
              onPageRendered={(e) => {
                if (!viewerRef.current) return;
                const viewer = viewerRef.current;
                const nextPageIndex = e.pageIndex + 1;

                // Schedule sequential rendering for remaining pages
                const renderNext = () => {
                  if (nextPageIndex >= viewer.doc.numPages) return;

                  // Use queueMicrotask + setTimeout for non-blocking UI
                  queueMicrotask(() => {
                    setTimeout(() => {
                      try {
                        viewer.renderPage(nextPageIndex);
                      } catch (err) {
                        console.warn(
                          `Failed to render page ${nextPageIndex}:`,
                          err,
                        );
                      }

                      // recursively render next page
                      if (nextPageIndex + 1 < viewer.doc.numPages) {
                        e.pageIndex = nextPageIndex; // update for next recursion
                        renderNext();
                      }
                    }, 1000); // 1s delay between pages
                  });
                };

                renderNext();
              }}
              style={{ flex: 1, minHeight: 0 }}
            />
          </Worker>
        )}
      </div>
    </Portal>
  );
}
