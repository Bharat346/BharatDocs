"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, FileText, BookOpen, Newspaper } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

const ICONS = {
  docs: FileText,
  notes: BookOpen,
  blogs: Newspaper,
};

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const router = useRouter();
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Small delay to allow render before transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
          inputRef.current?.focus();
        });
      });
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setQuery("");
      }, 200); // Matches transition duration
      document.body.style.overflow = "auto";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  // Fetch search results
  const { data, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: () => fetch(`/api/search?q=${encodeURIComponent(query)}`).then(r => r.json()),
    enabled: query.length >= 1,
    staleTime: 0,
  });

  const hasResults = data && (data.docs?.length > 0 || data.notes?.length > 0 || data.blogs?.length > 0);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  if (!isRendered) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-16 sm:pt-24 px-4 pb-20">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`w-full max-w-2xl bg-[var(--bg)] rounded-2xl shadow-2xl overflow-hidden relative z-10 transition-all duration-200 ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4'
          }`}
      >
        {/* Input Header */}
        <div className="flex bg-transparent items-center gap-3 px-4 py-4">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
            className="flex-1 rounded-md p-1 border-none outline-none text-[var(--fg)] text-lg placeholder-[var(--fg-muted)]"
          />
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-2 no-scrollbar">
          {query.length < 1 ? null : isLoading ? (
            <div className="p-8 text-center text-[var(--fg-muted)] text-sm animate-pulse">
              Searching...
            </div>
          ) : hasResults ? (
            <div className="flex flex-col gap-4">
              {["docs", "notes", "blogs"].map((category) => {
                const items = data[category];
                if (!items || items.length === 0) return null;

                const CatIcon = ICONS[category];

                return (
                  <div key={category} className="px-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--fg-secondary)] mb-2 px-2">
                      {category}
                    </div>
                    <div className="flex flex-col gap-1">
                      {items.map((item) => {
                        const isPdf = item.fileType === "pdf";
                        let targetHref = `/${category}/${item.slug}`;
                        if (isPdf && item.filePath) {
                          const blobUrl = process.env.NEXT_PUBLIC_BLOB_URL || "https://p3o24xqzz16juii0.public.blob.vercel-storage.com";
                          targetHref = item.filePath.replace(blobUrl, "");
                        }
                        
                        return (
                          <Link
                            key={item.id}
                            href={targetHref}
                            target={isPdf ? "_blank" : undefined}
                            onClick={onClose}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors group"
                          >
                          <div className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] group-hover:border-[var(--primary-ghost)] text-[var(--fg-muted)] group-hover:text-[var(--primary)] transition-colors mt-0.5">
                            <CatIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[var(--fg)] truncate group-hover:text-[var(--primary)] transition-colors">
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="text-xs text-[var(--fg-secondary)] truncate mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      )})}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-[var(--fg-muted)] text-sm">
              No results found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
