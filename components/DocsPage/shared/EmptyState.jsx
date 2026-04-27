// app/(public)/docs/components/EmptyState.jsx
"use client";

import { motion } from "framer-motion";
import { FileText, Search } from "lucide-react";

export default function EmptyState({ searchTerm }) {
  const isSearch = Boolean(searchTerm);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto max-w-md h-fit text-center mt-40 py-14 px-6 rounded-2xl border backdrop-blur-sm bg-white/70 border-gray-200 dark:bg-zinc-900/60 dark:border-zinc-800"
    >
      {/* Icon */}
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400"
      >
        {isSearch ? <Search size={22} /> : <FileText size={22} />}
      </div>

      {/* Title */}
      <h3
        className="text-[clamp(1.125rem,4vw,1.25rem)] font-semibold mb-1 text-gray-800 dark:text-zinc-200"
      >
        {isSearch ? "No documents found" : "No collections available"}
      </h3>

      {/* Description */}
      <p
        className="text-sm leading-relaxed text-gray-600 dark:text-zinc-500"
      >
        {isSearch
          ? "Try adjusting your search keywords or filters."
          : "Create your first document collection to get started."}
      </p>
    </motion.div>
  );
}
