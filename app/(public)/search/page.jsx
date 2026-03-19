"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useThemeContext } from "@/components/ThemeProvider";
import {
  Search as SearchIcon,
  FileText,
  FileCode,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Library,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function SearchResults() {
  const { theme } = useThemeContext();
  const isDark = theme === "dark";
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localQuery, setLocalQuery] = useState(query);

  const fetchResults = async (q) => {
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(query);
    setLocalQuery(query);
  }, [query]);

  const handleSearch = (e) => {
    // Form submission will naturally update URL with Link prefetch
    if (!localQuery.trim()) {
      e.preventDefault();
    }
  };

  const getLink = (node) => {
    const coll = node.collectionName.toLowerCase(); // docs or notes
    if (coll === "notes") {
      // Notes: open till the last folder (parentSlug)
      let baseUrl = `/notes/${node.parentSlug || ""}`;
      if (node.fileType === "pdf") {
        const cleanPdfParam = node.slug || node.name;
        return `${baseUrl}?pdf=${encodeURIComponent(cleanPdfParam)}`;
      }
      return baseUrl;
    } else {
      // Docs: docs/parentSlug?child=slug or docs?child=slug
      if (!node.parentSlug) {
        return `/docs?child=${node.slug}`;
      }
      return `/docs/${node.parentSlug}?child=${node.slug}`;
    }
  };

  return (
    <div
      className={`min-h-screen pt-24 pb-20 px-6 transition-colors duration-500 ${isDark ? "bg-[#0a0a0a] text-white" : "bg-white text-neutral-900"}`}
    >
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header & Back */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <Link
            href="/"
            className="group flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-indigo-500 transition-colors self-start"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />{" "}
            Back Home
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
            Search{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              Results
            </span>
          </h1>
        </div>

        {/* Local Search Refinement */}
        <form action="/search" method="get" className="relative group">
          <input
            type="text"
            name="q"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search again..."
            className={`w-full text-base sm:text-lg md:text-xl lg:text-2xl font-semibold p-4 sm:p-5 md:p-6 lg:p-8 pr-12 sm:pr-14 md:pr-16 border-2 rounded-2xl sm:rounded-3xl transition-all outline-none placeholder:text-sm sm:placeholder:text-base ${isDark ? "bg-neutral-900 border-neutral-800 text-white focus:border-indigo-500" : "bg-white border-neutral-100 text-neutral-950 focus:border-indigo-500 shadow-sm"} placeholder:font-medium`}
          />
          <button
            type="submit"
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-neutral-400 group-hover:text-indigo-600 transition-colors"
          >
            <SearchIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
          </button>
        </form>

        {/* Results Info */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-100 dark:border-neutral-800 pb-3 sm:pb-4">
          <span>
            Found {results.length} nodes for "{query}"
          </span>
          {loading && (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          )}
        </div>

        {/* Results List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {results.length > 0 ? (
              results.map((node, i) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={getLink(node)}
                    className={`block group p-6 border-2 rounded-[20px] transition-all duration-300 ${isDark ? "bg-neutral-900 border-neutral-800 hover:border-indigo-500/50 hover:bg-neutral-950 shadow-indigo-500/5" : "bg-white border-neutral-100 hover:border-indigo-500/50 hover:bg-white shadow-sm hover:shadow-indigo-200/50"}`}
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors ${isDark ? "bg-neutral-800 text-neutral-400 group-hover:bg-indigo-600 group-hover:text-white" : "bg-white text-neutral-400 group-hover:bg-indigo-600 group-hover:text-white shadow-sm"}`}
                      >
                        {node.fileType === "pdf" ? (
                          <Library className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 min-w-0">
                          <span
                            className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest shrink-0 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}
                          >
                            {node.collectionName}
                          </span>
                          <span className="text-neutral-300 shrink-0">/</span>
                          <span
                            title={node.parentName || "Root"}
                            className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest truncate ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
                          >
                            {node.parentName || "Root"}
                          </span>
                        </div>
                        <h3
                          title={node.name}
                          className={`text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-tight leading-none group-hover:text-indigo-600 transition-colors truncate ${isDark ? "text-white" : "text-neutral-950"}`}
                        >
                          {node.name}
                        </h3>
                      </div>
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-neutral-300 group-hover:translate-x-1 group-hover:text-indigo-500 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : !loading ? (
              <div className="text-center py-16 sm:py-20 px-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl sm:rounded-[3rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                <SearchIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-neutral-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg md:text-xl font-bold text-neutral-400 uppercase tracking-tighter">
                  No results found for your query
                </p>
                <p className="text-[10px] sm:text-xs text-neutral-500 font-semibold uppercase tracking-widest mt-2">
                  Try different keywords or check spelling
                </p>
              </div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-transparent">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
