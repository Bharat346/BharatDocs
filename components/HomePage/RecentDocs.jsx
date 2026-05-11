"use client";

import { useEffect, useState } from "react";
import { FileText, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function RecentDocs({ theme }) {
  const isDark = theme === "dark";
  const { data: docs = [], isLoading: loading } = useQuery({
    queryKey: ["recent-docs"],
    queryFn: async () => {
      const res = await fetch("/api/docs/recent");
      if (!res.ok) throw new Error("Failed to fetch recent docs");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const getLink = (doc) => {
    const coll = doc.collectionName.toLowerCase();
    if (coll === "notes") {
      return `/notes/${doc.parentSlug || ""}`;
    } else {
      if (!doc.parentSlug) return `/docs?child=${doc.slug}`;
      return `/docs/${doc.parentSlug}?child=${doc.slug}`;
    }
  };

  return (
    <section className="py-16 md:py-24 px-6 max-w-7xl mx-auto transition-colors duration-500 bg-background">
      {/* Header */}
      <div className="flex items-end justify-between mb-10 md:mb-16">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-primary rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
              Fresh Updates
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95] text-foreground">
            Recently <span className="text-primary">Added</span>
          </h2>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div
              key={i}
              className="h-56 rounded-3xl animate-pulse bg-secondary-bg border border-border"
            />
          ))
        ) : docs.length > 0 ? (
          docs.map((doc, i) => (
            <Link key={doc.id} href={getLink(doc)} className="group block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="flex flex-col p-6 rounded-3xl border border-border transition-all duration-300 h-full bg-background hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 group-hover:bg-secondary-bg/50"
              >
                {/* Top */}
                <div className="flex items-center justify-between mb-5">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <FileText size={18} />
                  </div>
                  <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    <span className="text-primary">{doc.collectionName}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="truncate">{doc.parentName || "Root"}</span>
                  </div>

                  <h3 className="text-lg font-bold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {doc.name}
                  </h3>

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {doc.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-secondary-bg border border-border text-neutral-500"
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
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[2.5rem] border-border bg-secondary-bg/30">
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">
              No recent documents
            </p>
          </div>
        )}
      </div>
    </section>
  );
}