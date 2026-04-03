"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ChevronUp,
  Layers,
  ChevronRight,
  ChevronLeft,
  Home,
} from "lucide-react";

import EmptyState from "@/components/DocsPage/shared/EmptyState";
import DocsLoader from "@/components/DocsPage/shared/DocsLoader";
import { useScrollDetector } from "@/lib/utils/docsHelper";

import { shouldPrefetch } from "@/lib/network/network.config";

// MDX renderer (client only)
const MDXContent = dynamic(() => import("./MDXContent"), { ssr: false });

const MainContent = function MainContent({
  theme,
  selectedChild,
  mdxContent,
  frontmatter,
  onSidebarToggle,
  sidebarOpen,
  onTocToggle,
  scrollRef,
}) {
  /* ---------------- Scroll Container Ref ---------------- */

  const { showScrollTop, scrollToTop } = useScrollDetector(scrollRef, 300);

  /* ---------------- Empty State ---------------- */
  if (!selectedChild) return <EmptyState theme={theme} />;

  return (
    <div className={`flex flex-col flex-1 h-full min-w-0 relative ${theme === "dark" ? "bg-[#0a0a0a] border-l border-zinc-800" : "bg-neutral-50 shadow-inner"}`}>
      {/* ---------------- HEADER ---------------- */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur ${theme === "dark" ? "bg-[#0a0a0a]/80 border-zinc-800" : "bg-neutral-50/80 border-neutral-200"}`}>
        <div className="flex h-14 items-center justify-between px-4">
          <div
            className={`flex items-center gap-2 min-w-0 ${
              theme === "dark" ? "text-white" : ""
            }`}
          >
            <div className="flex items-center gap-0">
              <Button size="icon" variant="ghost" onClick={onSidebarToggle}>
                {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
              </Button>

              <Link
                href="/docs"
                size="icon"
                variant="ghost"
                className="hidden sm:flex"
                prefetch={shouldPrefetch()}
              >
                <Home size={20} />
              </Link>
            </div>

            <div className="ml-2 min-w-0">
              <h1 className="text-[clamp(1rem,3vw,1.25rem)] font-semibold truncate">
                {frontmatter?.title || selectedChild.name}
              </h1>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onTocToggle}
            className={theme === "dark" ? "text-white" : ""}
          >
            <Layers className="mr-2 h-4 w-4" />
            Contents
          </Button>
        </div>
      </header>

      {/* ---------------- MAIN SCROLL AREA ---------------- */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto max-w-5xl px-6 sm:px-12 lg:px-16 py-12 md:py-16">
          {mdxContent ? (
            <article
              id="mdx-content-container"
              className={`prose prose-lg md:prose-xl max-w-none transition-all duration-500 ${
                theme === "dark" 
                  ? "prose-invert prose-headings:text-white prose-p:text-neutral-300 prose-strong:text-white prose-code:text-indigo-400" 
                  : "prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-strong:text-neutral-900 prose-code:text-indigo-600"
              }`}
            >
              <MDXContent
                content={mdxContent}
                theme={theme}
              />
            </article>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <DocsLoader theme={theme} />
              <p className={`mt-4 text-sm font-medium ${theme === "dark" ? "text-neutral-500" : "text-neutral-400"}`}>
                Preparing your document...
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ---------------- SCROLL TO TOP BUTTON ---------------- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: showScrollTop ? 1 : 0,
          scale: showScrollTop ? 1 : 0.9,
        }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-6 right-6 z-50 pointer-events-none"
      >
        <Button
          size="icon"
          onClick={scrollToTop}
          className={`pointer-events-auto rounded-full shadow-lg ${
            theme === "dark"
              ? "bg-blue-600 text-white"
              : "bg-blue-500 text-white"
          }`}
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
};

export default MainContent;
