"use client";

import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import { X } from "lucide-react";
import { useThemeContext } from "@/components/ThemeProvider";
import Portal from "@/components/Portal";

export default function PDFViewer({ fileUrl, onClose }) {
  const { theme } = useThemeContext();

  // Hide sidebar for a clean view
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [],
  });

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="fixed bottom-4 right-4 z-[10001] p-3 rounded-full
                     bg-blue-500/80 hover:bg-blue-500 text-white"
        >
          <X size={24} />
        </button>

        {/* PDF Container */}
        <div
          className="relative w-full h-full overflow-hidden"
          style={{
            backgroundColor: theme === "dark" ? "#000" : "#fff",
          }}
        >
          <Worker workerUrl="/pdf.worker.min.js">
            <Viewer
              fileUrl={fileUrl}
              plugins={[defaultLayoutPluginInstance]}
              defaultScale={SpecialZoomLevel.PageFit}
              theme={theme === "dark" ? "dark" : "light"}
            />
          </Worker>
        </div>
      </div>
    </Portal>
  );
}
