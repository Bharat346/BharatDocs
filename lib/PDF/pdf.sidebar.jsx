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
  const [width, setWidth] = useState(320);
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
      if (newWidth >= 220 && newWidth <= 600) {
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
  // TAB CONFIG
  // ---------------------------
  const tabs = [
    {
      id: "previews",
      label: "Pages",
      icon: LayoutDashboard,
    },
    {
      id: "chat",
      label: "AI Chat",
      icon: MessageSquareText,
    },
  ];

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isMobile && show && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10007] transition-opacity"
        />
      )}

      <aside
        ref={sidebarRef}
        style={{
          width: isMobile
            ? show ? "100%" : "0"
            : show ? `${width}px` : "0",
        }}
        className={`
          flex-shrink-0 border-r flex flex-col overflow-hidden
          ${isDark
            ? "bg-[#0a0a0a] text-white border-white/[0.06]"
            : isMobile
              ? "bg-white text-black border-gray-200"
              : "bg-white/95 text-black border-gray-200 backdrop-blur-xl"
          }
          ${isResizing ? "" : "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"}
          ${isMobile
            ? "fixed inset-y-0 left-0 z-[10008] shadow-2xl"
            : "relative"}
        `}
      >
        {/* RESIZE HANDLE (desktop) */}
        {!isMobile && show && (
          <div
            onMouseDown={startResizing}
            className={`
              absolute top-0 right-0 w-[3px] h-full cursor-col-resize z-50
              transition-colors duration-150
              hover:bg-blue-500/40
              ${isResizing ? "bg-blue-500" : "bg-transparent"}
            `}
          />
        )}

        {/* MOBILE CLOSE BUTTON */}
        {isMobile && show && (
          <button
            onClick={onClose}
            className={`
              absolute top-3 right-3 p-2 rounded-xl z-10 transition-all
              ${isDark
                ? "text-zinc-500 hover:bg-white/[0.06] hover:text-red-400"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-red-500"}
            `}
          >
            <X size={18} />
          </button>
        )}

        {/* TOP TABS */}
        <div
          className={`
            w-full grid grid-cols-2 border-b flex-shrink-0
            ${isDark ? "border-white/[0.06]" : "border-gray-200"}
          `}
        >
          {tabs.map((tab) => {
            const isActive = mode === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={`
                  relative py-3.5 flex flex-col items-center gap-1.5 transition-all duration-200
                  ${isActive
                    ? isDark
                      ? "text-blue-400"
                      : "text-blue-600"
                    : isDark
                      ? "text-zinc-600 hover:text-zinc-400"
                      : "text-gray-400 hover:text-gray-600"
                  }
                `}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span className={`text-[10px] font-bold uppercase tracking-[0.08em] ${
                  isActive ? "opacity-100" : "opacity-60"
                }`}>
                  {tab.label}
                </span>
                {/* Active indicator */}
                {isActive && (
                  <div className={`absolute bottom-0 left-4 right-4 h-[2px] rounded-full ${
                    isDark ? "bg-blue-400" : "bg-blue-600"
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 w-full overflow-hidden flex flex-col">
          {mode === "previews" ? (
            <div className={`flex-1 overflow-y-auto px-2 py-3 ${
              isDark ? "pdf-sidebar-dark" : "pdf-sidebar-light"
            }`}>
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