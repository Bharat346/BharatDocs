"use client";

import { Layers } from "lucide-react";

export default function TableOfContent({
  theme,
  headings = [],
  activeHeadingId = null,
  onHeadingClick,
  className = "",
  isMobile = false,
}) {
  const handleHeadingClick = (headingId) => {
    onHeadingClick?.(headingId);
  };

  return (
    <aside
      className={`h-full flex flex-col border-l ${
        theme === "dark"
          ? "bg-zinc-900/95 border-zinc-800 backdrop-blur-sm"
          : "bg-white/95 border-gray-200 backdrop-blur-sm"
      } ${isMobile ? "w-full" : ""} ${className}`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b sticky top-0 z-10 ${
          theme === "dark" ? "border-zinc-800" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg ${
              theme === "dark"
                ? "bg-zinc-800/50 text-blue-400"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            <Layers size={18} />
          </div>
          <h3 className={`font-semibold text-sm ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>Table of Contents</h3>
        </div>
      </div>

      {/* Headings List */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {headings.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p
              className={`text-sm ${
                theme === "dark" ? "text-zinc-500" : "text-gray-500"
              }`}
            >
              This document has no headings
            </p>
          </div>
        ) : (
          <nav className="flex flex-col">
            {headings.map((h) => {
              const isActive = h.id === activeHeadingId;
              return (
                <button
                  key={h.id}
                  onClick={() => handleHeadingClick(h.id)}
                  style={{
                    paddingLeft: `${(h.level - 1) * 16}px`,
                  }}
                  className={`text-left w-full py-2 rounded-md text-base transition-colors duration-200 ${
                    isActive
                      ? theme === "dark"
                        ? "text-blue-400 font-medium"
                        : "text-blue-600 font-medium"
                      : theme === "dark"
                      ? "text-white hover:text-blue-400"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  {h.text}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </aside>
  );
}
