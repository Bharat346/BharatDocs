"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  const router = useRouter();
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
    e.preventDefault();
    if (localQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(localQuery)}`);
    }
  };

  const getLink = (node) => {
    const coll = node.collectionName.toLowerCase(); // docs or notes
    if (coll === "notes") {
      // Notes: open till the last folder (parentSlug)
      return `/notes/${node.parentSlug || ""}`;
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
        <div className="flex flex-col gap-6">
          <Link
            href="/"
            className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-500 hover:text-indigo-500 transition-colors self-start"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
            Back Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
            Search{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              Results
            </span>
          </h1>
        </div>

        {/* Local Search Refinement */}
        <form onSubmit={handleSearch} className="relative group">
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search again..."
            className={`w-full text-2xl font-black tracking-tight p-6 pr-16 border-2 rounded-3xl transition-all outline-none ${isDark ? "bg-neutral-900 border-neutral-800 text-white focus:border-indigo-500" : "bg-white border-neutral-100 text-neutral-950 focus:border-indigo-500 shadow-sm"}`}
          />
          <button
            type="submit"
            className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 group-hover:text-indigo-600 transition-colors"
          >
            <SearchIcon className="w-8 h-8" />
          </button>
        </form>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-neutral-500 border-b border-neutral-100 dark:border-neutral-800 pb-4">
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
                    className={`block group p-6 border-2 rounded-[2.5rem] transition-all duration-300 ${isDark ? "bg-neutral-900 border-neutral-800 hover:border-indigo-500/50 hover:bg-neutral-950 shadow-indigo-500/5" : "bg-white border-neutral-100 hover:border-indigo-500/50 hover:bg-white shadow-sm hover:shadow-indigo-200/50"}`}
                  >
                    <div className="flex items-center gap-6">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDark ? "bg-neutral-800 text-neutral-400 group-hover:bg-indigo-600 group-hover:text-white" : "bg-white text-neutral-400 group-hover:bg-indigo-600 group-hover:text-white shadow-sm"}`}
                      >
                        {node.fileType === "pdf" ? (
                          <Library className="w-6 h-6" />
                        ) : (
                          <FileText className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-indigo-400" : "text-indigo-600"}`}
                          >
                            {node.collectionName}
                          </span>
                          <span className="text-neutral-300">/</span>
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
                          >
                            {node.parentName || "Root"}
                          </span>
                        </div>
                        <h3
                          className={`text-xl md:text-2xl font-black uppercase tracking-tight leading-none group-hover:text-indigo-600 transition-colors ${isDark ? "text-white" : "text-neutral-950"}`}
                        >
                          {node.name}
                        </h3>
                      </div>
                      <ChevronRight className="w-6 h-6 text-neutral-300 group-hover:translate-x-1 group-hover:text-indigo-500 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : !loading ? (
              <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-[3rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                <SearchIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-xl font-black text-neutral-400 uppercase tracking-tighter">
                  No results found for your query
                </p>
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-2">
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
