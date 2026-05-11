"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense } from "react";
import BlogCard from "./BlogCard";
import {
  Search,
  Tag,
  X,
  Newspaper,
  ArrowLeft,
} from "lucide-react";
import BharatLoader from "@/components/ui/loader";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function BlogGrid() {
  const [blogs, setBlogs] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [search, setSearch] = useState("");
  const { data, isLoading: loading } = useQuery({
    queryKey: ["blogs", selectedTag],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedTag) params.set("tag", selectedTag);
      const res = await fetch(`/api/blogs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch blogs");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 30 * 60 * 1000,
  });

  useEffect(() => {
    if (data?.blogs) setBlogs(data.blogs);
    if (data?.tags) setAllTags(data.tags);
  }, [data]);

  const filteredBlogs = useMemo(() => {
    if (!search.trim()) return blogs;
    const q = search.toLowerCase();
    return blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        (b.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [blogs, search]);

  return (
    <div className="space-y-10">
      {/* Premium Modern Header Area */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
              <div className="space-y-1">
                <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase text-foreground leading-[0.8]">
                  The <span className="text-indigo-600 dark:text-indigo-400">Journal</span>
                </h1>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 tracking-widest uppercase pl-1">
                  Engineering , Science & Design Insights
                </p>
              </div>
          </div>

          {/* Centered, narrow search bar */}
          <div className="relative w-full max-w-sm group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search the library..."
              className="w-full pl-11 pr-10 py-3.5 bg-secondary-bg border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-border via-border to-transparent" />
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border ${
              !selectedTag
                ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20"
                : "bg-transparent text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:border-indigo-500/50 hover:text-indigo-600"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border flex items-center gap-1.5 ${
                selectedTag === tag
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20"
                  : "bg-transparent text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:border-indigo-500/50 hover:text-indigo-600"
              }`}
            >
              <Tag className="w-3 h-3" />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <BharatLoader fullScreen={false} />
        </div>
      ) : filteredBlogs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-2xl mb-4">
            <Newspaper className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-bold mb-1">No blogs found</h3>
          <p className="text-sm text-neutral-500">
            {search
              ? "Try a different search term"
              : selectedTag
                ? "No blogs with this tag yet"
                : "Blogs will appear here once published"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredBlogs.map((blog, i) => (
              <BlogCard key={blog.id} blog={blog} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Results count */}
      {!loading && filteredBlogs.length > 0 && (
        <p className="text-center text-xs text-neutral-400 font-medium">
          Showing {filteredBlogs.length} blog{filteredBlogs.length !== 1 ? "s" : ""}
          {selectedTag && ` tagged "${selectedTag}"`}
        </p>
      )}
    </div>
  );
}
