"use client";

import { BookOpen, FileText, Home } from "lucide-react";

export default function Sidebar({
  theme,
  children,
  selectedChild,
  onChildSelect,
  onHomeClick,
  isMobile = false,
}) {
  return (
    <aside
      className={`h-full flex flex-col ${
        theme === "dark"
          ? "bg-zinc-900/95 border-zinc-800 backdrop-blur-sm shadow-xl"
          : "bg-white/95 border-gray-200 backdrop-blur-sm shadow-lg"
      } ${isMobile ? "w-full" : "w-72"}`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b shrink-0 ${
          theme === "dark" ? "border-zinc-800" : "border-gray-200"
        }`}
      >
        <button
          onClick={onHomeClick}
          className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 hover:scale-[0.98] active:scale-[0.97] ${
            theme === "dark"
              ? "hover:bg-zinc-800/60 text-zinc-300 hover:text-white"
              : "hover:bg-gray-100/80 text-gray-700 hover:text-gray-900"
          }`}
        >
          <div
            className={`p-2 rounded-lg ${
              theme === "dark"
                ? "bg-zinc-800/60 text-blue-400"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            <Home size={18} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-sm">Documentation</div>
            <div className="text-xs opacity-70">Browse all articles</div>
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {children.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                theme === "dark"
                  ? "bg-zinc-800/50 text-zinc-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <BookOpen size={24} />
            </div>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-zinc-500" : "text-gray-500"
              }`}
            >
              No documents found
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {children.map((child) => {
              const isSelected = selectedChild?.nodeId === child.nodeId;
              const isFile = child.nodeType === "file";

              return (
                <button
                  key={child.nodeId}
                  onClick={() => onChildSelect(child)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 group ${
                    isSelected
                      ? theme === "dark"
                        ? "bg-blue-500/10 text-blue-400 shadow-inner shadow-blue-500/20"
                        : "bg-blue-100/50 text-blue-600 shadow-inner shadow-blue-300/20"
                      : theme === "dark"
                      ? "text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
                      : "text-gray-700 hover:bg-gray-100/70 hover:text-gray-900"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                      isSelected
                        ? theme === "dark"
                          ? "bg-blue-500/20"
                          : "bg-blue-100"
                        : theme === "dark"
                        ? "bg-zinc-800/50 group-hover:bg-zinc-700/50"
                        : "bg-gray-100 group-hover:bg-gray-200"
                    }`}
                  >
                    {isFile ? <FileText size={16} /> : <BookOpen size={16} />}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium truncate">
                      {child.name}
                    </div>
                    {child.description && (
                      <div className="text-xs opacity-70 truncate mt-0.5">
                        {child.description}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div
                      className={`w-2 h-2 rounded-full animate-pulse ${
                        theme === "dark" ? "bg-blue-400" : "bg-blue-500"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className={`p-4 border-t shrink-0 ${
          theme === "dark"
            ? "border-zinc-800 text-zinc-500"
            : "border-gray-200 text-gray-500"
        }`}
      >
        <div className="text-xs text-center">
          Documentation Portal v1.0
        </div>
      </div>
    </aside>
  );
}
