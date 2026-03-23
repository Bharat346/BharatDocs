"use client";

import {
  X,
  LayoutDashboard,
  MessageSquareText,
} from "lucide-react";
import PDFChat from "./pdf.rag";
import { useState, useRef, useEffect, useCallback } from "react";

export default function PDFSidebar({
  show,
  isDark,
  isMobile,
  onClose,
  Thumbnails,
  nodeId,
  fileUrl,
}) {
  const [mode, setMode] = useState("previews");
  const [width, setWidth] = useState(340);
  const [isResizing, setIsResizing] = useState(false);

  const sidebarRef = useRef(null);

  // ---------------------------
  // RESIZE HANDLERS (desktop)
  // ---------------------------
  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      if (newWidth >= 220 && newWidth <= 650) {
        setWidth(newWidth);
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  // ---------------------------
  // BACKGROUND STYLES (FIXED)
  // ---------------------------
  const bgClass = isDark
    ? "bg-zinc-950 text-white border-white/10"
    : isMobile
      ? "bg-white text-black border-gray-200"
      : "bg-white/90 text-black border-gray-200 backdrop-blur-xl";

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isMobile && show && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 z-[10007]"
        />
      )}

      <aside
        ref={sidebarRef}
        style={{
          width: isMobile
            ? show
              ? "100%"
              : "0"
            : show
              ? `${width}px`
              : "0",
        }}
        className={`
          flex-shrink-0 border-r flex flex-col overflow-hidden
          ${bgClass}
          ${isResizing ? "" : "transition-all duration-300 ease-in-out"}
          ${isMobile
            ? "fixed inset-y-0 left-0 z-[10008] shadow-2xl"
            : "relative"}
        `}
      >
        {/* ---------------------------
            RESIZE HANDLE (desktop)
        ---------------------------- */}
        {!isMobile && show && (
          <div
            onMouseDown={startResizing}
            className={`
              absolute top-0 right-0 w-1 h-full cursor-col-resize z-50
              transition-colors
              hover:bg-blue-500/50
              ${isResizing ? "bg-blue-500" : "bg-transparent"}
            `}
          />
        )}

        {/* ---------------------------
            MOBILE CLOSE BUTTON
        ---------------------------- */}
        {isMobile && show && (
          <button
            onClick={onClose}
            className={`
              absolute top-3 right-3 p-2 rounded-lg z-10
              ${isDark
                ? "text-zinc-400 hover:bg-white/10 hover:text-red-400"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-red-500"}
            `}
          >
            <X size={20} />
          </button>
        )}

        {/* ---------------------------
            TOP TABS
        ---------------------------- */}
        <div
          className={`
            w-full grid grid-cols-2 border-b
            ${isDark ? "border-white/10" : "border-gray-200"}
          `}
        >
          <button
            onClick={() => setMode("previews")}
            className={`
              p-4 flex flex-col items-center transition
              ${
                mode === "previews"
                  ? isDark
                    ? "bg-white/10 text-blue-400"
                    : "bg-gray-100 text-blue-600"
                  : "opacity-60 hover:opacity-100"
              }
            `}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-bold mt-1 uppercase">
              Previews
            </span>
          </button>

          <button
            onClick={() => setMode("chat")}
            className={`
              p-4 flex flex-col items-center transition relative
              ${
                mode === "chat"
                  ? isDark
                    ? "bg-white/10 text-blue-400"
                    : "bg-gray-100 text-blue-600"
                  : "opacity-60 hover:opacity-100"
              }
            `}
          >
            <MessageSquareText size={20} />
            <span className="text-[10px] font-bold mt-1 uppercase">
              AI Chat
            </span>
          </button>
        </div>

        {/* ---------------------------
            CONTENT AREA
        ---------------------------- */}
        <div className="flex-1 w-full overflow-hidden flex flex-col">
          {mode === "previews" ? (
            <div className="flex-1 overflow-y-auto px-2 py-4">
              <Thumbnails />
            </div>
          ) : (
            <PDFChat nodeId={nodeId} fileUrl={fileUrl} isDark={isDark} />
          )}
        </div>
      </aside>
    </>
  );
}