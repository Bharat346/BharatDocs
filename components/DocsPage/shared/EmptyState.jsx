// app/(public)/docs/components/EmptyState.jsx
"use client";

import { motion } from "framer-motion";
import { FileText, Search } from "lucide-react";

export default function EmptyState({ theme, searchTerm }) {
  const isDark = theme === "dark";
  const isSearch = Boolean(searchTerm);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`
        mx-auto max-w-md h-fit text-center mt-40 py-14 px-6 rounded-2xl
        border backdrop-blur-sm
        ${
          isDark
            ? "bg-zinc-900/60 border-zinc-800"
            : "bg-white/70 border-gray-200"
        }
      `}
    >
      {/* Icon */}
      <div
        className={`
          mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl
          ${
            isDark
              ? "bg-zinc-800 text-blue-400"
              : "bg-blue-50 text-blue-600"
          }
        `}
      >
        {isSearch ? <Search size={22} /> : <FileText size={22} />}
      </div>

      {/* Title */}
      <h3
        className={`
          text-lg font-semibold mb-1
          ${isDark ? "text-zinc-200" : "text-gray-800"}
        `}
      >
        {isSearch ? "No documents found" : "No collections available"}
      </h3>

      {/* Description */}
      <p
        className={`
          text-sm leading-relaxed
          ${isDark ? "text-zinc-500" : "text-gray-600"}
        `}
      >
        {isSearch
          ? "Try adjusting your search keywords or filters."
          : "Create your first document collection to get started."}
      </p>
    </motion.div>
  );
}
