"use client";

import { useEffect, useState } from "react";
import { Maximize2, Info } from "lucide-react";

const ZOOM_LEVELS = [50, 75, 100, 125, 150];

export default function PDFToolbar({
  currentPage,
  totalPages,
  scale,
  onFit,
  onHelp,
  onJumpToPage,
  onZoomChange, // NEW
  theme,
}) {
  const [pageInput, setPageInput] = useState(String(currentPage + 1));
  const [isMobile, setIsMobile] = useState(false);

  const isDark = theme === "dark";

  /* Detect mobile */
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  /* Sync page input */
  useEffect(() => {
    setPageInput(String(currentPage + 1));
  }, [currentPage]);

  const commitPageChange = () => {
    if (!totalPages) return;

    let page = parseInt(pageInput, 10);
    if (isNaN(page)) {
      setPageInput(String(currentPage + 1));
      return;
    }

    page = Math.max(1, Math.min(page, totalPages));
    setPageInput(String(page));
    onJumpToPage(page - 1);
  };

  return (
    <div
      className={`
        fixed bottom-4 left-1/2 -translate-x-1/2
        flex items-center gap-5
        px-5 py-2.5
        rounded-2xl
        backdrop-blur-xl
        shadow-2xl
        border
        z-[10002]
        transition-colors duration-300
        ${
          isDark
            ? "bg-black/70 border-white/10 text-white"
            : "bg-white/95 border-gray-200 text-gray-900"
        }
      `}
    >
      {/* Page Section */}
      <div className="flex items-center gap-2">
        <span
          className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}
        >
          Pg
        </span>

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ""))}
          onBlur={commitPageChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitPageChange();
          }}
          className="w-10 text-center bg-transparent outline-none font-semibold text-sm rounded-md border "
        />

        <span className={isDark ? "text-white/40" : "text-gray-400"}>/</span>

        <span
          className={`text-sm ${isDark ? "text-white/70" : "text-gray-600"}`}
        >
          {totalPages}
        </span>
      </div>

      {/* Divider */}
      <div className={`h-5 w-px ${isDark ? "bg-white/10" : "bg-gray-300"}`} />

      {/* Zoom Selector */}
      <select
        value={Math.round(scale * 100)}
        onChange={(e) => {
          const value = Number(e.target.value) / 100;
          onZoomChange(value);
        }}
        className={`
          text-sm font-medium
          px-2 py-1
          rounded-md
          border
          outline-none
          ${
            isDark
              ? "bg-white/5 border-white/10 text-white"
              : "bg-white border-gray-300 text-gray-900"
          }
        `}
      >
        {ZOOM_LEVELS.map((z) => (
          <option key={z} value={z} className={`text-sm ${isDark ? "bg-black/70" : "bg-white/70"}`}>
            {z}%
          </option>
        ))}
      </select>

      {/* Divider */}
      <div className={`h-5 w-px ${isDark ? "bg-white/10" : "bg-gray-300"}`} />

      {/* Fit Button */}
      <button
        onClick={onFit}
        className={`
          p-2 rounded-lg transition
          ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}
        `}
      >
        <Maximize2 size={16} />
      </button>

      {/* Info Button — Desktop Only */}
      {!isMobile && (
        <button
          onClick={onHelp}
          className={`
            p-2 rounded-lg transition
            ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}
          `}
        >
          <Info size={16} />
        </button>
      )}
    </div>
  );
}
