"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Folder, FileText, Search, SlidersHorizontal } from "lucide-react";
import { handlePdfIntent } from "@/lib/utils/intent";

export default function DocsList({ childrenDocs, basePath = "/docs" }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("order"); // 'order', 'alpha', 'newest', 'oldest'

  const filtered = useMemo(() => {
    let results = childrenDocs.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
      if (!matchSearch) return false;
      return true;
    });

    if (sort === "alpha") {
      results = results.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "newest") {
      results = results.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    } else if (sort === "oldest") {
      results = results.sort((a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0));
    }
    // "order" uses the original order from props

    return results;
  }, [childrenDocs, search, sort]);

  const folders = filtered.filter((c) => c.type === "folder");
  const files = filtered.filter((c) => c.type === "document");

  return (
    <div className="w-full">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--fg-muted)]" />
          <input
            type="text"
            placeholder="Search documents or collections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[var(--fg-muted)]" />
          <select 
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
          >
            <option value="order">Custom Order</option>
            <option value="alpha">A-Z</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {folders.length > 0 && (
        <section className="mb-10 animate-fade-in-up">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--fg-muted)] mb-4">Collections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {folders.map((folder) => (
              <Link key={folder.id} href={`${basePath}/${folder.slug}`} className="card p-4 flex items-center gap-3 group rounded-xl">
                <div className="p-2 rounded-lg bg-[var(--primary-ghost)] text-[var(--primary)] flex-shrink-0">
                  <Folder className="w-5 h-5" />
                </div>
                <span className="font-bold text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors">{folder.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {files.length > 0 && (
        <section className="animate-fade-in-up delay-100 opacity-0 [animation-fill-mode:forwards]">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--fg-muted)] mb-4">Documents</h2>
          <div className="grid grid-cols-1 gap-3">
            {files.map((file) => {
              const isPdf = file.fileType === "pdf";
              let href = `${basePath}/${file.slug}`;
              if (isPdf && file.filePath) {
                const blobUrl = process.env.NEXT_PUBLIC_BLOB_URL || "https://p3o24xqzz16juii0.public.blob.vercel-storage.com";
                href = file.filePath.replace(blobUrl, "");
              }
              return (
                <Link 
                  key={file.id} 
                  href={href} 
                  target={isPdf ? "_blank" : undefined} 
                  onClick={(e) => {
                    if (isPdf) {
                      handlePdfIntent(e, href);
                    }
                  }}
                  className="card p-4 flex items-center gap-3 group rounded-xl"
                >
                  <div className={`p-2 rounded-lg flex-shrink-0 ${isPdf ? "bg-red-500/10 text-red-500" : "bg-[var(--primary-ghost)] text-[var(--primary)]"}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors flex items-center gap-2">
                      {file.name}
                      {isPdf && <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase rounded bg-red-500/10 text-red-500 border border-red-500/20">PDF</span>}
                    </span>
                    {file.description && <p className="text-sm text-[var(--fg-secondary)] line-clamp-1 mt-0.5">{file.description}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 border border-dashed border-[var(--border)] rounded-2xl animate-fade-in-up">
          <Search className="w-10 h-10 mx-auto text-[var(--fg-muted)] mb-3 opacity-50" />
          <p className="text-[var(--fg-muted)]">No results found.</p>
        </div>
      )}
    </div>
  );
}
