"use client";

import { useEffect, useState } from "react";
import { FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RecentDocs({ theme }) {
  const isDark = theme === "dark";
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch("/api/docs/recent");
        const data = await res.json();
        setDocs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const getLink = (doc) => {
    const coll = doc.collectionName.toLowerCase();
    if (coll === "notes") {
      return `/notes/${doc.parentSlug || ""}`;
    } else {
      if (!doc.parentSlug) return `/docs?child=${doc.slug}`;
      return `/docs/${doc.parentSlug}?child=${doc.slug}`;
    }
  };

  const headingColor = isDark ? "text-white" : "text-neutral-950";

  return (
    <section className="py-12 md:py-24 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 md:mb-14">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-[3px] bg-indigo-600 rounded-full" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
              Fresh Updates
            </span>
          </div>

          <h2
            className={`text-4xl md:text-6xl font-extrabold tracking-tight leading-[0.95] ${headingColor}`}
          >
            Recently{" "}
            <span className="text-indigo-600 dark:text-indigo-500">
              Added
            </span>
          </h2>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className={`h-64 rounded-3xl animate-pulse ${
                  isDark ? "bg-neutral-900/50" : "bg-neutral-50"
                } border ${
                  isDark ? "border-neutral-800" : "border-neutral-100"
                }`}
              />
            ))
        ) : docs.length > 0 ? (
          docs.map((doc, i) => (
            <Link
              key={doc.id}
              href={getLink(doc)}
              className="group block h-full"
            >
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                viewport={{ once: true }}
                className={`flex flex-col p-7 rounded-[2rem] border transition-all duration-500 h-full ${
                  isDark
                    ? "bg-zinc-900/40 border-zinc-800/80 hover:border-indigo-500/50 hover:bg-zinc-900/70"
                    : "bg-white border-neutral-100 hover:border-indigo-200 hover:shadow-xl"
                }`}
              >
                {/* Top */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`p-3 rounded-xl transition-all duration-500 ${
                      isDark
                        ? "bg-zinc-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white"
                        : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>

                  <ExternalLink className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-indigo-500" />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">
                      {doc.collectionName}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-neutral-400" />
                    <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                      {doc.parentName || "Root"}
                    </span>
                  </div>

                  <h3
                    className={`text-lg md:text-xl font-semibold leading-snug transition-colors ${
                      isDark
                        ? "text-white group-hover:text-indigo-400"
                        : "text-neutral-900 group-hover:text-indigo-600"
                    }`}
                  >
                    {doc.name}
                  </h3>

                  {/* Bottom Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="mt-auto pt-6 flex flex-wrap gap-2">
                      {doc.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className={`text-[10px] font-semibold px-3 py-1 rounded-full ${
                            isDark
                              ? "bg-white/5 text-neutral-400 border border-white/10"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-16 text-center border-2 border-dashed rounded-[2.5rem] border-neutral-200 dark:border-neutral-800">
            <p className="text-sm font-semibold text-neutral-400 uppercase tracking-widest">
              No documents found
            </p>
          </div>
        )}
      </div>
    </section>
  );
}