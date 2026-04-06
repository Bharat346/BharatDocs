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
      className={`h-full flex flex-col transition-all duration-300 ${
        theme === "dark"
          ? "bg-[#0a0a0a] text-white"
          : "bg-white text-neutral-900"
      } ${isMobile ? "w-full" : "w-72"}`}
    >
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
            <span className="text-xl font-semibold ml-2 mb-5 mt-3">Chapters</span>
            {children.map((child) => {
              const isSelected = selectedChild?.nodeId === child.nodeId;

              return (
                <button
                  key={child.nodeId}
                  onClick={() => onChildSelect(child)}
                  className={`w-full flex flex-col gap-1 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                    isSelected
                      ? theme === "dark"
                        ? "bg-blue-500/10 text-white shadow-[0_0_20px_rgba(59,130,246,0.1)] border border-blue-500/20"
                        : "bg-blue-50 text-blue-600 shadow-sm border border-blue-100"
                      : theme === "dark"
                        ? "text-zinc-400 hover:bg-zinc-800/40 hover:text-white border border-transparent"
                        : "text-neutral-600 hover:bg-neutral-100/70 hover:text-neutral-900 border border-transparent"
                  }`}
                >
                  <div className="w-full flex items-center gap-3">
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm font-semibold truncate px-1">
                        {child.name}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className={`p-4 shrink-0 ${
          theme === "dark"
            ? "text-zinc-500"
            : "text-gray-500"
        }`}
      >
        <div className="text-xs text-center font-medium opacity-50">Documentation Portal v4.2</div>
      </div>
    </aside>
  );
}
