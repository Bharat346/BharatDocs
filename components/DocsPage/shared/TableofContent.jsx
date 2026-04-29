"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { Layers, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { buildTocTree } from "@/lib/utils/buildTocTree";

export default function TableOfContent({
  containerRef,
  headings = [], 
  className = "",
  isMobile = false,
}) {
  /* ---------------- Headings ---------------- */
  const processedHeadings = useMemo(() => 
    headings.slice(1).map((h, i) => ({ ...h, key: h.key || `${h.id}-${i}` })), 
    [headings]
  );
  const tree = useMemo(() => buildTocTree(processedHeadings), [processedHeadings]);

  const [activeId, setActiveId] = useState(null);
  const [openMap, setOpenMap] = useState({});
  const isProgrammaticScroll = useRef(false);

  /* ---------------- Auto expand ---------------- */
  useEffect(() => {
    if (!processedHeadings.length) return;

    setOpenMap((prev) => {
      const next = { ...prev };
      for (const h of processedHeadings) {
        if (h.level <= 2 && next[h.id] === undefined) {
          next[h.id] = false; // Initially only headings show, not subheadings
        }
      }
      return next;
    });
  }, [processedHeadings]);

  /* ---------------- Active heading observer ---------------- */
  useEffect(() => {
    if (!processedHeadings.length) return;

    const scrollRoot = isMobile ? null : containerRef?.current;
    if (!scrollRoot && !isMobile) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root: scrollRoot,
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0,
      },
    );

    processedHeadings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [processedHeadings, containerRef, isMobile]);

  /* ---------------- Scroll logic (FIXED) ---------------- */
  const scrollToHeading = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    isProgrammaticScroll.current = true;

    if (isMobile) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.scrollBy({ top: -80 });
    } else {
      const container = containerRef?.current;
      if (!container) return;

      const containerTop = container.getBoundingClientRect().top;
      const elementTop = el.getBoundingClientRect().top;

      const scrollOffset = elementTop - containerTop + container.scrollTop - 80;

      container.scrollTo({
        top: scrollOffset,
        behavior: "smooth",
      });
    }

    setActiveId(id);
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 450);
  };

  /* ---------------- Render node ---------------- */
  const renderNode = (node) => {
    const open = openMap[node.id] ?? false; // Default to closed (no subheadings shown initially)

    return (
      <div key={node.key} className="pl-1">
        <Collapsible
          open={open}
          onOpenChange={(v) => setOpenMap((m) => ({ ...m, [node.id]: v }))}
        >
          <div className="flex items-center gap-1">
            {node.children.length > 0 && (
              <CollapsibleTrigger className="p-1">
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform text-neutral-400 dark:text-zinc-500",
                    !open && "-rotate-90"
                  )}
                />
              </CollapsibleTrigger>
            )}

            <Link
              href={`#${node.id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToHeading(node.id);
              }}
              className={cn(
                "py-1 text-sm text-left block transition-colors",
                activeId === node.id
                  ? "text-blue-600 dark:text-blue-400 font-medium"
                  : "text-black hover:text-blue-600 dark:text-neutral-500 dark:hover:text-blue-400",

              )}
            >
              {node.text}
            </Link>
          </div>

          {node.children.length > 0 && (
            <CollapsibleContent className="ml-4 space-y-1">
              {node.children.map(renderNode)}
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    );
  };

  /* ---------------- Render ---------------- */
  return (
    <aside
      className={cn(
        "flex flex-col h-full transition-all duration-300 bg-background text-foreground",
        className,
      )}
    >
      {/* Header */}
      <div className="px-2 py-4 h-14 z-10">
        <div className="flex items-center gap-2 pb-4">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            <Layers size={18} />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400/80">
            Table of Contents
          </h3>

        </div>
      </div>

      {/* Body */}
      <div className={cn("flex-1 px-1 pb-4 mt-5", !isMobile && "overflow-y-auto")}>
        {processedHeadings.length === 0 ? (
          <p className="text-xs text-center text-gray-500 dark:text-zinc-500 py-8">
            This document has no headings
          </p>

        ) : (
          <nav className="space-y-1">{tree.map(renderNode)}</nav>
        )}
      </div>
    </aside>
  );
}
