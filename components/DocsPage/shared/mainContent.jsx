"use client";

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
import { useScrollDetector } from "@/lib/utils/docsHelper";
import { shouldPrefetch } from "@/lib/network/network.config";
import BharatLoader from "@/components/ui/loader";

export default function MainContent({
  selectedChild,
  mdxContent,
  scrollRef,
}) {
  const { showScrollTop, scrollToTop } = useScrollDetector(scrollRef, 300);

  if (!selectedChild) return <EmptyState />;

  return (
    <div className="flex flex-col flex-1 h-full min-w-0 relative bg-background">
      {/* ── Main Scroll Area ── */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 sm:px-10 lg:px-14 py-10 md:py-14 ">
          {mdxContent ? (
            <article
              id="mdx-content-container"
              className="prose max-w-none min-h-screen"
            >
              {mdxContent}
            </article>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <BharatLoader text="Preparing your document..." />
            </div>
          )}
        </div>
      </main>

      {/* ── Scroll to Top ── */}
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
          className="pointer-events-auto rounded-full shadow-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-300"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
}
