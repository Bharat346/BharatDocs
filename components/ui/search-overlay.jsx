"use client";

import {
  Search,
  Loader2,
  FileSearch,
  FileText,
  Library,
  ChevronRight,
  X,
  Sparkles,
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import Portal from "@/components/ui/portal";
import { useSearch } from "@/hooks/useSearch";

export default function SearchOverlay({
  isOpen,
  onOpenChange,
  theme = "dark",
}) {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    getLink,
  } = useSearch();

  // ✅ Proper ESC handler (fixes memory leak + more human UX)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpenChange]);

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span
              key={i}
              className="text-blue-400 bg-blue-500/10 px-1 rounded-md"
            >
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[10vh] sm:pt-[15vh]">
            
            {/* 🌫️ Background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-2xl"
              onClick={() => onOpenChange(false)}
            />

            {/* 🧊 Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`relative z-[1001] w-[95%] max-w-3xl rounded-2xl overflow-hidden
              ${
                theme === "dark"
                  ? "bg-gradient-to-b from-zinc-900/90 to-zinc-950/95 border border-white/5"
                  : "bg-white/90 border border-black/5"
              }
              backdrop-blur-3xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)]
              flex flex-col max-h-[75vh]`}
            >
              {/* 🔍 Header */}
              <div className="relative flex items-center px-6 py-5 border-b border-white/5">
                <div
                  className={`absolute left-8 ${
                    searchLoading ? "text-blue-400" : "text-zinc-500"
                  }`}
                >
                  {searchLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </div>

                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-12 text-xl sm:text-2xl font-medium outline-none bg-transparent
                  ${
                    theme === "dark"
                      ? "text-white placeholder:text-zinc-600"
                      : "text-black placeholder:text-gray-400"
                  }`}
                />

                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute right-6 p-2 rounded-xl hover:bg-white/5 text-zinc-400 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 📄 Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

                {/* ✨ Default */}
                {searchQuery.trim() === "" ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3 px-2 text-zinc-500 text-xs font-medium">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      Recently updated
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      {searchResults.slice(0, 4).map((node, i) => (
                        <ResultItem
                          key={node.id}
                          node={node}
                          index={i}
                          {...{ getLink, highlightMatch, query: searchQuery, theme, close: () => onOpenChange(false) }}
                        />
                      ))}
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (

                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-2 text-xs text-zinc-500">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Results for "{searchQuery}"
                      </div>
                      <span className="text-blue-400">
                        {searchResults.length}
                      </span>
                    </div>

                    {searchResults.map((node, i) => (
                      <ResultItem
                        key={node.id}
                        node={node}
                        index={i}
                        isMatch
                        {...{ getLink, highlightMatch, query: searchQuery, theme, close: () => onOpenChange(false) }}
                      />
                    ))}
                  </div>

                ) : !searchLoading ? (

                  <div className="py-20 text-center text-zinc-500">
                    <FileSearch className="w-10 h-10 mx-auto mb-4 opacity-40" />
                    <p className="text-lg font-medium">
                      Nothing found for "{searchQuery}"
                    </p>
                    <p className="text-sm mt-1">
                      Try simpler keywords.
                    </p>
                  </div>

                ) : null}
              </div>
              
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

function ResultItem({
  node,
  getLink,
  highlightMatch,
  query,
  theme,
  close,
  isMatch = false,
  index = 0,
}) {
  const isDark = theme === "dark";

  return (
    <a
      href={getLink(node)}
      onClick={close}
      style={{ transitionDelay: `${index * 20}ms` }}
      className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200
      ${isDark ? "hover:bg-white/[0.03]" : "hover:bg-black/[0.03]"}`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center
        ${
          isDark
            ? "bg-white/[0.03] text-zinc-400"
            : "bg-black/[0.03] text-gray-500"
        }`}
      >
        {node.fileType === "pdf" ? <Library size={20} /> : <FileText size={20} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs text-zinc-500 mb-1">
          {node.collectionName} / {node.parentName || "Root"}
        </div>

        <div className={`text-[15px] font-medium truncate ${isDark ? "text-white" : "text-black"}`}>
          {highlightMatch(node.name, query)}
        </div>
      </div>

      <ChevronRight className="opacity-0 group-hover:opacity-100 transition" />
    </a>
  );
}