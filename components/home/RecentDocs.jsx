"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronRight, FileText, Calendar } from "lucide-react";
import { QUERY_CACHE } from "@/components/providers/QueryProvider";
import Image from "next/image";

export default function RecentDocs({ initialDocs = null }) {
  const { data, isLoading } = useQuery({
    queryKey: ["recent-docs"],
    queryFn: () => fetch("/api/docs/recent?limit=6").then((r) => r.json()),
    initialData: initialDocs ? initialDocs : undefined,
    ...QUERY_CACHE.listings,
  });

  const docs = data || [];

  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // The container is taller than the viewport. 
      // The scrollable distance while sticky is rect.height - viewportHeight
      const totalScrollable = rect.height - viewportHeight;
      if (totalScrollable <= 0) return;

      let p = -rect.top / totalScrollable;
      if (p < 0) p = 0;
      if (p > 1) p = 1;

      setProgress(p);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const trackHeight = 300;

  return (
    <div ref={containerRef} className="relative w-full h-[150vh]">
      <div className="sticky top-0 w-full h-screen flex items-center justify-center overflow-hidden">
        {/* ── SVG Dotted Grid Background ── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1400px] h-[600px] z-[-1] flex justify-center opacity-100" aria-hidden="true">
          <svg className="w-[200%] h-full text-black/15 dark:text-white/10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dotGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" fill="#b5b5b5cf" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotGrid)" />
          </svg>
        </div>

        {/* ── Electron Track beside the section ── */}
        <div className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2 z-[90] pointer-events-none" style={{ height: `${trackHeight}px` }}>
          {/* Track Line */}
          <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-[var(--border)] opacity-30 -translate-x-1/2" />

          {/* Start/End markers */}
          <div className="absolute top-0 left-0 -translate-x-1/2 flex items-center gap-2 md:gap-3">
            <div className="w-4 md:w-6 h-[2px] bg-[var(--primary)]" />
            <span className="hidden md:block text-sm font-bold uppercase tracking-widest text-[var(--primary)] font-mono">Start</span>
          </div>
          <div className="absolute bottom-0 translate-y-[70px] left-0 -translate-x-1/2 flex items-center gap-2 md:gap-3">
            <div className="w-4 md:w-6 h-[2px] bg-[var(--primary)]" />
            <span className="hidden md:block text-sm font-bold uppercase tracking-widest text-[var(--primary)] font-mono">End</span>
          </div>

          {/* The Electron */}
          <div
            className="absolute left-8 top-0 will-change-transform scale-75 md:scale-100 -ml-[50px] -mt-[50px] w-[40px] h-[40px]"
            style={{ transform: `translate3d(0, ${progress * trackHeight + 65}px, 0)` }}
          >
            <img
              alt="Electron"
              src="/electron.svg"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative pl-16 md:pl-32 pb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-[var(--fg)] mb-3">
                Recently Updated Docs
              </h2>
              <p className="text-lg text-[var(--fg-secondary)]">
                Fresh documentation and guides added to the platform.
              </p>
            </div>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors group"
            >
              View all docs
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-6 h-32 skeleton" />
              ))}
            </div>
          ) : docs?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {docs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/docs/${doc.slug}`}
                  className="card p-6 h-full block group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="p-2 rounded-lg bg-[var(--primary-ghost)] text-[var(--primary)]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-[var(--fg-muted)] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(doc.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--fg)] mb-2 group-hover:text-[var(--primary)] transition-colors line-clamp-1 relative z-10">
                    {doc.name}
                  </h3>
                  {doc.description && (
                    <p className="text-sm text-[var(--fg-secondary)] line-clamp-2 relative z-10">
                      {doc.description}
                    </p>
                  )}
                  {/* Subtle hover background accent */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-ghost)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-2xl">
              <p className="text-[var(--fg-muted)]">No recent documents found.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
