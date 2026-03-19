"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Layers, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useHeadingsFromRef } from "@/lib/utils/docsHelper";
import { buildTocTree } from "@/lib/utils/buildTocTree";

export default function TableOfContent({
  theme,
  containerRef,
  mdxContent,
  className = "",
  isMobile = false,
}) {
  const isDark = theme === "dark";

  /* ---------------- Headings ---------------- */
  const headings = useHeadingsFromRef(containerRef, mdxContent);
  const tree = useMemo(() => buildTocTree(headings), [headings]);

  const [activeId, setActiveId] = useState(null);
  const [openMap, setOpenMap] = useState({});
  const isProgrammaticScroll = useRef(false);

  /* ---------------- Auto expand ---------------- */
  useEffect(() => {
    if (!headings.length) return;

    setOpenMap((prev) => {
      const next = { ...prev };
      for (const h of headings) {
        if (h.level <= 2 && next[h.id] === undefined) {
          next[h.id] = false; // Initially only headings show, not subheadings
        }
      }
      return next;
    });
  }, [headings]);

  /* ---------------- Active heading observer ---------------- */
  useEffect(() => {
    if (!headings.length) return;

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

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings, containerRef, isMobile]);

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
                    "h-3 w-3 transition-transform",
                    !open && "-rotate-90",
                    isDark && "text-zinc-300",
                  )}
                />
              </CollapsibleTrigger>
            )}

            <button
              onClick={() => scrollToHeading(node.id)}
              className={cn(
                "py-1 text-sm truncate text-left",
                activeId === node.id
                  ? "text-blue-500 font-medium"
                  : isDark
                    ? "text-zinc-300 hover:text-blue-400"
                    : "text-gray-700 hover:text-blue-600",
              )}
            >
              {node.text}
            </button>
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
        "flex flex-col h-full",
        isDark ? "bg-transparent text-white" : "bg-transparent text-neutral-900",
        className,
      )}
    >
      {/* Header */}
      <div className={cn("px-2 py-4 sticky top-0 z-10", isMobile && "pt-20")}>
        <div className="flex items-center gap-2 pt-2 pb-5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            <Layers size={18} />
          </div>
          <h3 className="text-[clamp(0.85rem,2vw,0.9rem)] font-semibold text-blue-500">
            Table of Contents
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className={cn("flex-1 px-1 pb-4", !isMobile && "overflow-y-auto")}>
        {headings.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground py-8">
            This document has no headings
          </p>
        ) : (
          <nav className="space-y-1">{tree.map(renderNode)}</nav>
        )}
      </div>
    </aside>
  );
}
