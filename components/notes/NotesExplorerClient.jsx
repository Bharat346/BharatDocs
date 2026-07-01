"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Folder, FileText, ExternalLink, Home, ChevronRight } from "lucide-react";
import { getSubtreeCache, prefetchSubtree } from "@/lib/cache/notes-client-cache";
import { formatBytes } from "@/lib/utils/format";

export default function NotesExplorerClient({ initialNotes, initialSegments }) {
  const [segments, setSegments] = useState(initialSegments);
  const [currentNotes, setCurrentNotes] = useState(initialNotes);

  const rootSlug = segments[0] || null;

  // Prefetch subtree for the current root folder in background
  useEffect(() => {
    if (rootSlug) {
      prefetchSubtree(rootSlug);
    }
  }, [rootSlug]);

  const folders = currentNotes.filter((n) => n.type === "folder");
  const files = currentNotes.filter((n) => n.type === "note");

  // Prefetch ALL root folders if we are on the main /notes page
  useEffect(() => {
    if (segments.length === 0) {
      folders.forEach((folder) => {
        prefetchSubtree(folder.slug);
      });
    }
  }, [segments, folders]);

  // Sync state if initial props change from a true server navigation
  useEffect(() => {
    if (segments.join("/") !== initialSegments.join("/")) {
      setSegments(initialSegments);
      setCurrentNotes(initialNotes);
    }
  }, [initialSegments, initialNotes]);

  // Intercept click on subfolders to navigate client-side instantly using the cache
  const navigateTo = (newSegments) => {
    const targetSlug = newSegments[newSegments.length - 1];
    const targetRootSlug = newSegments[0];

    const cache = getSubtreeCache(targetRootSlug);
    if (cache) {
      // Find the folder node in cache
      const folderNode = cache.find(n => n.slug === targetSlug && n.type === "folder");
      if (folderNode) {
        const children = cache.filter(n => n.parentId === folderNode.id);

        // Update URL client-side
        const newUrl = `/notes/${newSegments.join("/")}`;
        window.history.pushState(null, "", newUrl);
        setSegments(newSegments);
        setCurrentNotes(children);
        return true;
      }
    }
    return false;
  };

  const handleFolderClick = (e, folderSlug) => {
    const newSegments = [...segments, folderSlug];
    const success = navigateTo(newSegments);
    if (success) {
      e.preventDefault();
    }
  };

  const handleBreadcrumbClick = (e, index) => {
    const newSegments = segments.slice(0, index + 1);
    const success = navigateTo(newSegments);
    if (success) {
      e.preventDefault();
    }
  };

  // Handle popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (!path.startsWith("/notes")) return;

      const newSegments = path.split("/").filter(Boolean).slice(1);
      if (newSegments.length === 0) {
        setSegments([]);
        window.location.reload();
        return;
      }

      const newRootSlug = newSegments[0];
      const cache = getSubtreeCache(newRootSlug);
      if (cache) {
        const folderNode = cache.find(n => n.slug === newSegments[newSegments.length - 1] && n.type === "folder");
        if (folderNode) {
          const children = cache.filter(n => n.parentId === folderNode.id);
          setSegments(newSegments);
          setCurrentNotes(children);
        } else {
          window.location.reload();
        }
      } else {
        window.location.reload();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="overflow-x-auto no-scrollbar">
        <ol className="flex items-center min-w-min whitespace-nowrap bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 shadow-sm">
          <li className="flex items-center">
            <Link
              href="/notes"
              className="text-[var(--fg-muted)] hover:text-[var(--primary)] transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Home className="w-4 h-4" />
              <span>Notes</span>
            </Link>
          </li>

          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            const href = `/notes/${segments.slice(0, index + 1).join("/")}`;

            return (
              <li key={href} className="flex items-center">
                <ChevronRight className="w-4 h-4 text-[var(--fg-muted)] mx-2 flex-shrink-0" />
                {isLast ? (
                  <span className="text-sm font-bold text-[var(--fg)]" aria-current="page">
                    {decodeURIComponent(segment)}
                  </span>
                ) : (
                  <Link
                    href={href}
                    onClick={(e) => handleBreadcrumbClick(e, index)}
                    className="text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--primary)] transition-colors"
                  >
                    {decodeURIComponent(segment)}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Grid Content */}
      {currentNotes.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[var(--border)] rounded-2xl bg-[var(--bg-secondary)] shadow-sm">
          <Folder className="w-12 h-12 mx-auto text-[var(--fg-muted)] mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-[var(--fg)] mb-2">Folder is empty</h3>
          <p className="text-sm text-[var(--fg-muted)] max-w-sm mx-auto">
            No notes or subfolders found in this directory.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {folders.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--fg-secondary)] mb-6 flex items-center gap-2">
                Folders
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {folders.map((folder) => {
                  const targetHref = `/notes/${segments.concat(folder.slug).join("/")}`;
                  return (
                    <Link
                      key={folder.id}
                      href={targetHref}
                      onClick={(e) => handleFolderClick(e, folder.slug)}
                      className="card p-5 group hover:border-[var(--primary)] hover:bg-[var(--bg-secondary)] flex flex-col h-full"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-[var(--primary-ghost)] text-[var(--primary)]">
                          <Folder className="w-6 h-6 fill-current opacity-20" />
                        </div>
                        {folder.subFolderCount > 0 && (
                          <span className="text-xs font-bold text-[var(--fg-muted)] bg-[var(--bg-tertiary)] px-2 py-1 rounded-full">
                            {folder.subFolderCount} {folder.subFolderCount === 1 ? 'Folder' : 'Folders'}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors mb-2">
                        {folder.name}
                      </h3>
                      {folder.description && (
                        <p className="text-sm text-[var(--fg-secondary)] line-clamp-2 mt-auto">
                          {folder.description}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {files.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--fg-secondary)] mb-6 flex items-center gap-2">
                Files & Documents
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {files.map((file) => {
                  const isPdf = file.fileType === "pdf";
                  let targetHref = file.filePath;
                  if (isPdf) {
                    try {
                      const url = new URL(file.filePath);
                      targetHref = url.pathname;
                    } catch (e) {}
                  } else {
                    targetHref = `/notes/${segments.concat(file.slug).join("/")}`;
                  }

                  return (
                    <Link
                      key={file.id}
                      href={targetHref}
                      target={isPdf ? "_blank" : undefined}
                      onClick={isPdf ? (e) => {
                        if (typeof window !== 'undefined' && window.innerWidth < 768) {
                          e.preventDefault();
                          const fullUrl = window.location.origin + targetHref;
                          window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}`, '_blank');
                        }
                      } : undefined}
                      className="card p-5 group flex flex-col h-full"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-2.5 rounded-lg ${isPdf
                          ? "bg-red-500/10 text-red-500"
                          : "bg-[var(--primary-ghost)] text-[var(--primary)]"
                          }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          {isPdf && (
                            <span className="text-[10px] font-mono uppercase bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded">
                              PDF
                            </span>
                          )}
                          {file.fileSize && (
                            <span className="text-xs font-mono text-[var(--fg-muted)]">
                              {formatBytes(file.fileSize)}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-bold text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors mb-2 line-clamp-2">
                        {file.name}
                      </h3>

                      {file.description && (
                        <p className="text-sm text-[var(--fg-secondary)] line-clamp-2 mb-4">
                          {file.description}
                        </p>
                      )}

                      <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--fg-muted)]">
                        <span>{new Date(file.updatedAt).toLocaleDateString()}</span>
                        {isPdf ? (
                          <span className="flex items-center gap-1 group-hover:text-[var(--primary)] transition-colors">
                            Open <ExternalLink className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 group-hover:text-[var(--primary)] transition-colors">
                            Read <ChevronRightIcon className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function ChevronRightIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
