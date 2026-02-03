"use client";

import { forwardRef, useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

/* Magic UI */
import { Spinner } from "@/components/ui/spinner";

import MDXContent from "./MDXContent";


/* ---------------------------------------------
   Loader
--------------------------------------------- */
function DocumentLoader() {
  return (
    <div className="mx-auto min-w-[80%] max-w-6xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Spinner size="sm" />
        <span className="text-sm text-muted-foreground">
          Loading document…
        </span>
      </div>

      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-10/12" />
    </div>
  );
}

/* ---------------------------------------------
   Component
--------------------------------------------- */
const MainContent = forwardRef(
  (
    {
      theme,
      selectedChild,
      mdxContent,
      loading,
      onHomeClick,
      onSidebarToggle,
      sidebarOpen,
      onTocToggle,
    },
    ref
  ) => {
    const [showScrollTop, setShowScrollTop] = useState(false);

    /* Scroll detection */
    useEffect(() => {
      const el = ref?.current;
      if (!el) return;

      const onScroll = () => setShowScrollTop(el.scrollTop > 300);
      el.addEventListener("scroll", onScroll);
      return () => el.removeEventListener("scroll", onScroll);
    }, [ref]);

    const scrollToTop = () =>
      ref?.current?.scrollTo({ top: 0, behavior: "smooth" });

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

    /* -----------------------------------------
       Empty State
    ----------------------------------------- */
    if (!selectedChild) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-10 text-center">
            <FileText className="mx-auto mb-4 text-muted-foreground" size={42} />
            <h2 className="text-lg font-semibold">Select a document</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a file from the sidebar to start reading.
            </p>
            <Button className="mt-6" onClick={onSidebarToggle}>
              Open Sidebar
            </Button>
          </Card>
        </div>
      );
    }

    /* -----------------------------------------
       Render
    ----------------------------------------- */
    return (
      <div className="flex flex-col flex-1 min-w-0">
        {/* ========== HEADER ========== */}
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2 min-w-0">
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

              <div className="ml-2 min-w-0">
                <h1 className="font-semibold truncate">
                  {selectedChild.name}
                </h1>
                {selectedChild.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedChild.description}
                  </p>
                )}
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={onTocToggle}>
              <Layers className="mr-2 h-4 w-4" />
              Contents
            </Button>
          </div>
        </header>

        {/* ========== MAIN ========== */}
        <main ref={ref} className="flex-1 overflow-y-auto">
          {loading ? (
            <DocumentLoader />
          ) : (
            <div className="mx-auto min-w-[80%] max-w-6xl p-6">
              {mdxContent ? (
                <article
                  className={`prose max-w-none ${
                    theme === "dark" ? "prose-invert" : ""
                  }`}
                >
                  <MDXContent content={mdxContent} theme={theme} />
                </article>
              ) : (
                <Card className="p-10 text-center">
                  <FileText
                    size={40}
                    className="mx-auto mb-4 text-muted-foreground"
                  />
                  <h3 className="font-semibold">No content available</h3>
                </Card>
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
          )}
        </main>

        {/* ========== SCROLL TO TOP ========== */}
        {showScrollTop && (
          <Button
            size="icon"
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 rounded-full shadow-lg"
          >
            <ChevronUp />
          </Button>
        )}
      </div>
    );
  }
);

export default MainContent;
