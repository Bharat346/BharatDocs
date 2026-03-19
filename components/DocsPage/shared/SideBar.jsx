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
      className={`h-full pt-20 flex flex-col ${
        theme === "dark"
          ? "bg-transparent text-white"
          : "bg-transparent text-neutral-900"
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
                        ? "text-blue-400"
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
                  ></div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-[clamp(0.85rem,2vw,0.9rem)] truncate">
                      {child.name}
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
        className={`p-4 border-t shrink-0 ${
          theme === "dark"
            ? "border-zinc-800 text-zinc-500"
            : "border-gray-200 text-gray-500"
        }`}
      >
        <div className="text-xs text-center">Documentation Portal v2.0</div>
      </div>
    </aside>
  );
}
