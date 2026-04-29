"use client";

import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Maximize,
  HelpCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function PDFBottomToolbar({
  isDark,
  currentPage,
  totalPages,
  scale,
  onPreviousPage,
  onNextPage,
  onJumpToPage,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onHelp,
}) {
  const [pageInput, setPageInput] = useState(String(currentPage + 1));

  useEffect(() => {
    setPageInput(String(currentPage + 1));
  }, [currentPage]);

  const commitPage = () => {
    const pageIndex = parseInt(pageInput, 10) - 1;
    if (!isNaN(pageIndex) && pageIndex >= 0 && pageIndex < totalPages) {
      onJumpToPage(pageIndex);
    } else {
      setPageInput(String(currentPage + 1));
    }
  };

  const btnClass = isDark
    ? "hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-200 active:scale-95"
    : "hover:bg-gray-100 text-gray-500 hover:text-gray-800 active:scale-95";

  return (
    <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-[10006] w-full max-w-[92%] sm:max-w-max pointer-events-none">
      <div
        className={`
           pointer-events-auto inline-flex items-center gap-1 sm:gap-1.5 
           px-2 sm:px-3 py-2 rounded-2xl shadow-2xl border
           backdrop-blur-xl transition-colors duration-200
           ${
             isDark
               ? "bg-zinc-900/90 border-white/[0.06] text-zinc-300"
               : "bg-white/90 border-gray-200/80 text-gray-700 shadow-gray-200/50"
           }
         `}
        style={{
          left: "50%",
          transform: "translateX(-50%)",
          position: "relative",
        }}
      >
        {/* ── Page Navigation ── */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onPreviousPage}
            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-150 ${btnClass}`}
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            <input
              type="text"
              inputMode="numeric"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ""))}
              onBlur={commitPage}
              onKeyDown={(e) => e.key === "Enter" && commitPage()}
              className={`
                     w-9 sm:w-11 text-center py-0.5 font-bold text-[13px] rounded-lg border outline-none 
                     transition-all duration-200
                     ${
                       isDark
                         ? "bg-zinc-800/60 border-white/[0.06] text-blue-400 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20"
                         : "bg-gray-50 border-gray-200 text-blue-600 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20"
                     }
                   `}
            />
            <span
              className={`text-[10px] font-medium ${isDark ? "text-zinc-600" : "text-gray-300"}`}
            >
              /
            </span>
            <span
              className={`text-[12px] font-bold tabular-nums ${
                isDark ? "text-zinc-600" : "text-gray-400"
              }`}
            >
              {totalPages || "—"}
            </span>
          </div>

          <button
            onClick={onNextPage}
            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-150 ${btnClass}`}
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Separator */}
        <div
          className={`w-px h-5 ${isDark ? "bg-white/[0.06]" : "bg-gray-200"}`}
        />

        {/* ── Zoom Controls ── */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onZoomOut}
            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-150 ${btnClass}`}
            title="Zoom out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onZoomFit}
            className={`
                 px-2 py-1 rounded-lg text-[11px] font-bold tabular-nums transition-all duration-150
                 ${
                   isDark
                     ? "text-zinc-500 hover:text-blue-400 hover:bg-white/[0.04]"
                     : "text-gray-400 hover:text-blue-600 hover:bg-gray-100"
                 }
               `}
            title="Fit to page"
          >
            {Math.round((scale || 1) * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-150 ${btnClass}`}
            title="Zoom in"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Separator */}
        <div
          className={`w-px h-5 hidden sm:block ${isDark ? "bg-white/[0.06]" : "bg-gray-200"}`}
        />

        {/* Help */}
        <button
          onClick={onHelp}
          className={`p-1.5 sm:p-2 rounded-lg transition-all duration-150 hidden sm:flex ${btnClass}`}
          title="Keyboard shortcuts"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
