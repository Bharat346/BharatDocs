"use client";

import { useEffect, useState } from "react";
import { List, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TableOfContents({ headings = [] }) {
  const [activeId, setActiveId] = useState("");
  const [activeH2Id, setActiveH2Id] = useState("");
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  useEffect(() => {
    if (headings.length === 0) return;

    // Intersection Observer to highlight active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const currentId = entry.target.id;
            setActiveId(currentId);

            // Find closest parent H2 for TOC highlighting
            const currentIdx = headings.findIndex(h => h.id === currentId);
            if (currentIdx !== -1) {
              const currentHeading = headings[currentIdx];
              if (currentHeading.level === 2) {
                setActiveH2Id(currentId);
              } else if (currentHeading.level > 2) {
                for (let i = currentIdx - 1; i >= 0; i--) {
                  if (headings[i].level === 2) {
                    setActiveH2Id(headings[i].id);
                    break;
                  }
                }
              }
            }
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const filteredHeadings = headings.filter(h => h.level <= 2);
  if (!filteredHeadings || filteredHeadings.length === 0) return null;

  const tocContent = (
    <ul className="space-y-2 border-l-2 border-[var(--border)] text-sm">
      {filteredHeadings.map((heading) => {
        const indent = Math.max(0, heading.level - 1) * 12;
        const isActive = activeId === heading.id || activeH2Id === heading.id;

        return (
          <li key={heading.id} style={{ paddingLeft: `${indent}px` }}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                setIsOpenMobile(false);
                const element = document.getElementById(heading.id);
                if (element) {
                  const y = element.getBoundingClientRect().top + window.scrollY - 100;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                  window.history.pushState(null, '', `#${heading.id}`);
                }
              }}
              className={`block pl-4 -ml-[2px] border-l-2 transition-all py-1 line-clamp-2 ${
                isActive
                  ? "border-[var(--primary)] text-[var(--primary)] font-medium"
                  : "border-transparent text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:border-[var(--border-hover)]"
              }`}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Desktop TOC */}
      <nav className="w-64 flex-shrink-0 hidden xl:block sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar pl-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--fg-muted)] mb-4 flex items-center gap-2">
          <List className="w-4 h-4" />
          On this page
        </h4>
        {tocContent}
      </nav>

      {/* Mobile TOC */}
      <div className="xl:hidden w-full mb-8 border border-[var(--border)] rounded-xl bg-[var(--bg-secondary)] overflow-hidden">
        <button 
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="w-full flex items-center justify-between p-4 bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          <span className="font-bold text-[var(--fg)] flex items-center gap-2 text-sm">
            <List className="w-4 h-4 text-[var(--fg-muted)]" />
            Table of Contents
          </span>
          {isOpenMobile ? <ChevronUp className="w-4 h-4 text-[var(--fg-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--fg-muted)]" />}
        </button>
        <AnimatePresence>
          {isOpenMobile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 py-4"
            >
              {tocContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
