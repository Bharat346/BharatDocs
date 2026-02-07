"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ChevronUp,
  Layers,
  ChevronRight,
  ChevronLeft,
  Home,
} from "lucide-react";

import EmptyState from "@/components/DocsPage/EmptyState";
import DocsLoader from "@/components/DocsPage/DocsLoader";
import { useScrollDetector } from "@/lib/utils/docsHelper";

// MDX renderer (client only)
const MDXContent = dynamic(() => import("./MDXContent"), { ssr: false });

const MainContent = function MainContent(
  {
    theme,
    selectedChild,
    mdxContent,
    frontmatter,
    onSidebarToggle,
    sidebarOpen,
    onTocToggle,
    scrollRef,
  }
) {
  /* ---------------- Scroll Container Ref ---------------- */

  const { showScrollTop, scrollToTop } = useScrollDetector(scrollRef, 300);

  /* ---------------- Metadata ---------------- */
  const metadata = selectedChild
    ? [
        {
          icon: Calendar,
          label: "Updated",
          value: new Date(selectedChild.updatedAt).toLocaleDateString(),
        },
        {
          icon: Clock,
          label: "ID",
          value: selectedChild.nodeId?.slice(0, 8),
        },
      ]
    : [];

  /* ---------------- Empty State ---------------- */
  if (!selectedChild) return <EmptyState theme={theme} />;

  return (
    <div className="flex flex-col flex-1 min-w-0 relative">
      {/* ---------------- HEADER ---------------- */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4">
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
              >
                <Home size={20} />
              </Link>
            </div>

            <div className="ml-2 min-w-0">
              <h1 className="font-semibold truncate">
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
      <main ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto min-w-[80%] max-w-6xl p-6 pt-0">
          {mdxContent ? (
            <article
              id="mdx-content-container"
              className={`prose max-w-none ${
                theme === "dark" ? "prose-invert" : ""
              }`}
            >
              {metadata.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {metadata.map((m, i) => (
                    <Badge key={i} variant="secondary">
                      <m.icon className="mr-1 h-3 w-3" />
                      {m.label}: {m.value}
                    </Badge>
                  ))}
                </div>
              )}

              <MDXContent
                content={mdxContent}
                theme={theme}
                // headingRefs={headingRefs}
              />
            </article>
          ) : (
            <DocsLoader theme={theme} />
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
