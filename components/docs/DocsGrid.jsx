"use client";

import Link from "next/link";
import { Folder, FileText, Search } from "lucide-react";
import { useState } from "react";

export default function DocsGrid({ docs = [] }) {
  if (!docs || docs.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-[var(--border)] rounded-2xl">
        <Folder className="w-12 h-12 mx-auto text-[var(--fg-muted)] mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-[var(--fg)] mb-2">No documents found</h3>
        <p className="text-sm text-[var(--fg-muted)] max-w-sm mx-auto">
          This folder is currently empty. Check back later for new documentation and guides.
        </p>
      </div>
    );
  }

  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = docs.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort: folders first, then documents
  const folders = filteredDocs.filter((d) => d.type === "folder");
  const documents = filteredDocs.filter((d) => d.type === "document");

  return (
    <div className="space-y-12">
      {/* Search Filter */}
      <div className="relative max-w-xl mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--fg-muted)]" />
        <input
          type="text"
          placeholder="Filter documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl py-3 pl-12 pr-4 text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
        />
      </div>
      {/* Folders Section */}
      {folders.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--fg-secondary)] mb-6 flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Collections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <Link
                key={folder.id}
                href={`/docs/${folder.slug}`}
                className="card p-4 flex items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl group hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              >
                <div className="p-3 rounded-xl bg-[var(--primary-ghost)] text-[var(--primary)] flex-shrink-0">
                  <Folder className="w-6 h-6 fill-current opacity-20" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors">
                    {folder.name}
                  </h3>
                  {folder.description && (
                    <p className="text-xs text-[var(--fg-muted)] line-clamp-1 mt-0.5">
                      {folder.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Documents Section */}
      {documents.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--fg-secondary)] mb-6 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {documents.map((doc) => {
              const isPdf = doc.fileType === "pdf";
              let targetHref = `/docs/${doc.slug}`;
              if (isPdf && doc.filePath) {
                const blobUrl = process.env.NEXT_PUBLIC_BLOB_URL || "https://p3o24xqzz16juii0.public.blob.vercel-storage.com";
                targetHref = doc.filePath.replace(blobUrl, "");
              }

              return (
                <Link
                  key={doc.id}
                  href={targetHref}
                  target={isPdf ? "_blank" : undefined}
                  className="card p-5 group flex gap-4 items-center bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                >
                  <div className={`p-2.5 rounded-lg flex-shrink-0 ${isPdf
                    ? "bg-red-500/10 text-red-500"
                    : "bg-[var(--primary-ghost)] text-[var(--primary)]"
                    }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors flex items-center gap-2">
                      {doc.name}
                      {isPdf && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase rounded bg-red-500/10 text-red-500 border border-red-500/20">
                          PDF
                        </span>
                      )}
                    </h3>
                    {doc.description && (
                      <p className="text-sm text-[var(--fg-secondary)] mt-1 line-clamp-1">
                        {doc.description}
                      </p>
                    )}
                    <p className="text-xs text-[var(--fg-muted)] mt-2">
                      Updated {new Date(doc.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
