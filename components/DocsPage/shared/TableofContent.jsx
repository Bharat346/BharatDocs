"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
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

  // No auto expand needed for flat list

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

  /* ---------------- Render ---------------- */
  return (
    <aside
      className={cn(
        "flex flex-col h-full transition-all duration-300 bg-transparent text-foreground justify-center items-center w-full relative group z-50",
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center w-full relative">
        {processedHeadings.length > 0 && (
          <div className="relative flex flex-col items-center">
            {/* Minimalist Pill Stack */}
            <nav className="flex flex-col items-center gap-1 relative w-full">
              {processedHeadings.map((node) => {
                const isActive = activeId === node.id;
                return (
                  <Link
                    key={node.key}
                    href={`#${node.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToHeading(node.id);
                    }}
                    className="flex justify-center py-1 w-12 cursor-pointer"
                  >
                    <div
                      className={cn(
                        "h-[3px] rounded-full transition-all duration-500 ease-out shrink-0",
                        isActive
                          ? "w-8 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] dark:bg-blue-400 dark:shadow-[0_0_8px_rgba(96,165,250,0.4)]"
                          : "w-5 bg-foreground/20 hover:bg-foreground/50 hover:w-8"
                      )}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Floating Large Content Div (Shows ALL headings) */}
            <div
              className="absolute right-8 top-1/2 -translate-y-1/2 w-80 bg-background border border-border/50 rounded-3xl shadow-2xl p-6 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 ease-out z-[9999]"
            >
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 text-center">
                Table of Contents
              </h4>
              <nav className="flex flex-col gap-2.5 max-h-[70vh] overflow-y-auto no-scrollbar">
                {processedHeadings.map((node) => {
                  const isActive = activeId === node.id;
                  return (
                    <Link
                      key={`expanded-${node.key}`}
                      href={`#${node.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToHeading(node.id);
                      }}
                      className={cn(
                        "text-xs tracking-wide transition-colors line-clamp-2 text-center",
                        isActive
                          ? "font-bold text-primary"
                          : "font-semibold text-neutral-500 hover:text-foreground"
                      )}
                    >
                      {node.text}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
