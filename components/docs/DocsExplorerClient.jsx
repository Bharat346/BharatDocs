"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Folder, FileText, Home, ChevronRight, BookOpen } from "lucide-react";
import { getSubtreeCache, prefetchSubtree } from "@/lib/cache/docs-client-cache";
import { motion, AnimatePresence } from "framer-motion";

export default function DocsExplorerClient({ initialDocs, initialSegments }) {
  const [segments, setSegments] = useState(initialSegments || []);
  const [currentDocs, setCurrentDocs] = useState(initialDocs || []);

  const rootSlug = segments[0] || null;

  // Prefetch subtree for the current root folder in background
  useEffect(() => {
    prefetchSubtree(rootSlug);
  }, [rootSlug]);

  const folders = currentDocs.filter((n) => n.type === "folder");
  const files = currentDocs.filter((n) => n.type === "document");

  // Prefetch ALL root folders if we are on the main /docs page
  useEffect(() => {
    if (segments.length === 0) {
      folders.forEach((folder) => {
        prefetchSubtree(folder.slug);
      });
    }
  }, [segments, folders]);

  // Sync state if initial props change from a true server navigation
  useEffect(() => {
    if (segments.join("/") !== (initialSegments || []).join("/")) {
      setSegments(initialSegments || []);
      setCurrentDocs(initialDocs || []);
    }
  }, [initialSegments, initialDocs]);

  // Intercept click on subfolders to navigate client-side instantly using the cache
  const navigateTo = (newSegments) => {
    const targetSlug = newSegments[newSegments.length - 1];
    const targetRootSlug = newSegments.length > 0 ? newSegments[0] : null;

    if (newSegments.length === 0) {
      // Go to root
      const cache = getSubtreeCache(null);
      if (cache) {
        const children = cache.filter(n => !n.parentId);
        const newUrl = `/docs`;
        window.history.pushState(null, "", newUrl);
        setSegments([]);
        setCurrentDocs(children);
        return true;
      }
      return false;
    }

    const cache = getSubtreeCache(targetRootSlug);
    if (cache) {
      let currentParentId = null;
      let folderNode = null;
      
      for (const segment of newSegments) {
        folderNode = cache.find(n => n.slug === segment && (n.parentId === currentParentId || (!n.parentId && !currentParentId)));
        if (!folderNode) return false;
        currentParentId = folderNode.id;
      }

      if (folderNode && folderNode.type === "folder") {
        const children = cache.filter(n => n.parentId === folderNode.id);

        // Update URL client-side
        const newUrl = `/docs/${newSegments.join("/")}`;
        window.history.pushState(null, "", newUrl);
        setSegments(newSegments);
        setCurrentDocs(children);
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

  const handleRootClick = (e) => {
    const success = navigateTo([]);
    if (success) {
      e.preventDefault();
    }
  };

  // Handle popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (!path.startsWith("/docs")) return;

      const newSegments = path.split("/").filter(Boolean).slice(1);
      
      if (newSegments.length === 0) {
        const cache = getSubtreeCache(null);
        if (cache) {
          setSegments([]);
          setCurrentDocs(cache.filter(n => !n.parentId));
          return;
        }
        window.location.reload();
        return;
      }

      const newRootSlug = newSegments[0];
      const cache = getSubtreeCache(newRootSlug);
      if (cache) {
        let currentParentId = null;
        let folderNode = null;
        
        for (const segment of newSegments) {
          folderNode = cache.find(n => n.slug === segment && (n.parentId === currentParentId || (!n.parentId && !currentParentId)));
          if (!folderNode) break;
          currentParentId = folderNode.id;
        }

        if (folderNode && folderNode.type === "folder") {
          const children = cache.filter(n => n.parentId === folderNode.id);
          setSegments(newSegments);
          setCurrentDocs(children);
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
        <ol className="flex items-center min-w-min whitespace-nowrap bg-[var(--bg-secondary)]/50 backdrop-blur-md border border-[var(--border)] rounded-xl px-4 py-2.5 shadow-sm">
          <li className="flex items-center">
            <Link
              href="/docs"
              onClick={handleRootClick}
              className="text-[var(--fg-muted)] hover:text-[var(--primary)] transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Home className="w-4 h-4" />
              <span>Docs</span>
            </Link>
          </li>

          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            const href = `/docs/${segments.slice(0, index + 1).join("/")}`;

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
      <AnimatePresence mode="wait">
        <motion.div 
          key={segments.join("/")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {currentDocs.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[var(--border)] rounded-3xl bg-[var(--bg-secondary)]/30 backdrop-blur-md shadow-sm">
              <Folder className="w-12 h-12 mx-auto text-[var(--fg-muted)] mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-[var(--fg)] mb-2">Folder is empty</h3>
              <p className="text-sm text-[var(--fg-muted)] max-w-sm mx-auto">
                No documents or subfolders found in this directory.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {folders.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--fg-secondary)] mb-6 flex items-center gap-2">
                    Topics
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {folders.map((folder, index) => {
                      const targetHref = `/docs/${segments.concat(folder.slug).join("/")}`;
                      return (
                        <motion.div
                          key={folder.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                        >
                          <Link
                            href={targetHref}
                            onClick={(e) => handleFolderClick(e, folder.slug)}
                            className="card p-5 group hover:border-[var(--primary)] hover:bg-[var(--bg-secondary)] flex flex-col h-full rounded-2xl"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="p-3 rounded-xl bg-[var(--primary-ghost)] text-[var(--primary)] shadow-sm">
                                <Folder className="w-6 h-6 fill-current opacity-20" />
                              </div>
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
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
              )}

              {files.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--fg-secondary)] mb-6 flex items-center gap-2">
                    Articles & Guides
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {files.map((file, index) => {
                      const targetHref = `/docs/${segments.concat(file.slug).join("/")}`;
                      return (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                        >
                          <Link
                            href={targetHref}
                            className="card p-5 group flex flex-col h-full rounded-2xl"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--fg-muted)] group-hover:text-[var(--primary)] group-hover:bg-[var(--primary-ghost)] transition-colors flex-shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <h3 className="font-bold text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                                {file.name}
                              </h3>
                            </div>

                            {file.description && (
                              <p className="text-sm text-[var(--fg-secondary)] line-clamp-2 mb-4">
                                {file.description}
                              </p>
                            )}

                            <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--fg-muted)]">
                              <span>{new Date(file.updatedAt).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1 group-hover:text-[var(--primary)] transition-colors">
                                Read <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
