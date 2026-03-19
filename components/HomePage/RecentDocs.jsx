"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  ChevronRight,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";
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
      // Notes: open till last folder (parentSlug)
      return `/notes/${doc.parentSlug || ""}`;
    } else {
      // Docs: docs/parent?child=slug
      if (!doc.parentSlug) return `/docs?child=${doc.slug}`;
      return `/docs/${doc.parentSlug}?child=${doc.slug}`;
    }
  };

  const bgClass = isDark ? "bg-neutral-900/50" : "bg-neutral-50";
  const borderClass = isDark ? "border-neutral-800" : "border-neutral-100";
  const headingColor = isDark ? "text-white" : "text-neutral-950";

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-[3px] bg-indigo-600 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
              Fresh Updates
            </span>
          </div>
          <h2
            className={`text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] ${headingColor}`}
          >
            Recently{" "}
            <span className="text-indigo-600 dark:text-indigo-500 font-black">
              Added
            </span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className={`h-40 rounded-[2.5rem] animate-pulse ${bgClass}`}
              />
            ))
        ) : docs.length > 0 ? (
          docs.map((doc, i) => (
            <Link
              key={doc.id}
              href={getLink(doc)}
              className="group block h-full outline-none"
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.01 }}
                className={`flex flex-col p-8 rounded-[2.5rem] border-2 transition-all duration-500 h-full ${bgClass} ${borderClass} hover:border-indigo-500/50 ${isDark ? "hover:bg-neutral-950" : "hover:bg-white"} shadow-sm ${isDark ? "hover:shadow-indigo-500/10" : "hover:shadow-indigo-200/50"} hover:shadow-2xl`}
              >
                <div className="flex items-center justify-between mb-8">
                  <div
                    className={`p-4 rounded-2xl transition-all duration-500 ${isDark ? "bg-neutral-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white" : "bg-white text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white"}`}
                  >
                    <FileText className="w-6 h-6" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[12px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-500">
                      {doc.collectionName}
                    </span>
                    <span className="text-neutral-300">/</span>
                    <span
                      className={`text-[12px] font-black uppercase tracking-widest ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
                    >
                      {doc.parentName || "Root"}
                    </span>
                  </div>
                  <h3
                    className={`text-xl md:text-2xl font-black uppercase tracking-tight leading-tight transition-colors group-hover:text-indigo-600 ${headingColor}`}
                  >
                    {doc.name}
                  </h3>
                </div>
              </motion.div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-neutral-100 dark:bg-neutral-900 rounded-[3rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800">
            <Clock className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-xl font-black text-neutral-400 uppercase tracking-tighter">
              It might be a Network Error Please Reload the page ....
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
