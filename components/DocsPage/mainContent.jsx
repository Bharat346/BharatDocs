"use client";

import { forwardRef, useEffect, useState, Suspense } from "react";
import {
  Home,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
  Calendar,
  Clock,
  ChevronUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";

import MDXContent from "./MDXContent";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";

/* ---------------------------------------------
   Suspense Loader (Spinner Only)
--------------------------------------------- */
export function DocumentSpinner({ theme }) {
  const isDark = theme === "dark";

  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <Spinner
          size="lg"
          className={`animate-spin ${
            isDark ? "border-white/70" : "border-black/70"
          } border-t-transparent`}
        />
        <p className={`text-lg font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>
          Loading document…
        </p>
        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Please wait a moment while we fetch your content.
        </p>
      </motion.div>
    </div>
  );
}

/* ---------------------------------------------
   MainContent Component
--------------------------------------------- */
const MainContent = forwardRef(function MainContent(
  {
    theme,
    selectedChild,
    mdxContent,
    onHomeClick,
    onSidebarToggle,
    sidebarOpen,
    onTocToggle,
  },
  ref,
) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  /* ---------------- Scroll Detection ---------------- */
  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    const onScroll = () => setShowScrollTop(el.scrollTop > 300);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [ref]);

  const scrollToTop = () =>
    ref?.current?.scrollTo({ top: 0, behavior: "smooth" });

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
  if (!selectedChild) {
    return <EmptyState theme={theme} />
  }

  /* ---------------- Render ---------------- */
  return (
    <div className="flex flex-col flex-1 min-w-0 relative">
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4">
          <div className={`flex items-center gap-2 min-w-0 ${theme === "dark" ? "text-white" : ""}`}>
            <div className="flex items-center gap-0">
              <Button size="icon" variant="ghost" onClick={onSidebarToggle}>
                {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={onHomeClick}
                className="hidden sm:flex"
              >
                <Home />
              </Button>
            </div>

            <div className="ml-2 min-w-0">
              <h1 className="font-semibold truncate">{selectedChild.name}</h1>
              {selectedChild.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {selectedChild.description}
                </p>
              )}
            </div>
          </div>

          <Button
            className={`${theme === "dark" ? "text-white" : ""}`}
            variant="secondary"
            size="sm"
            onClick={onTocToggle}
          >
            <Layers className="mr-2 h-4 w-4" />
            Contents
          </Button>
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <main ref={ref} className="flex-1 overflow-y-auto pb-24">
        <Suspense fallback={<DocumentSpinner theme={theme} />}>
          <div className="mx-auto min-w-[80%] max-w-6xl p-6">
            {mdxContent ? (
              <article className={`prose max-w-none ${theme === "dark" ? "prose-invert" : ""}`}>
                <MDXContent content={mdxContent} theme={theme} />
              </article>
            ) : (
              <LoadingState theme={theme} />
            )}

            {metadata.length > 0 && (
              <>
                <Separator className="my-10" />
                <div className="flex flex-wrap gap-2">
                  {metadata.map((m, i) => (
                    <Badge key={i} variant="secondary">
                      <m.icon className="mr-1 h-3 w-3" />
                      {m.label}: {m.value}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        </Suspense>
      </main>

      {/* ========== SCROLL TO TOP BUTTON ========== */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: showScrollTop ? 1 : 0, scale: showScrollTop ? 1 : 0.9 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          size="icon"
          onClick={scrollToTop}
          className={`${theme === "dark" ? "bg-blue-600 text-white" : "bg-blue-500 text-white"} rounded-full shadow-lg`}
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
});

export default MainContent;
