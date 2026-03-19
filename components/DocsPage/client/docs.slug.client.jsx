"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { useThemeContext } from "@/components/ThemeProvider";
import Sidebar from "@/components/DocsPage/shared/SideBar";
import TableOfContent from "@/components/DocsPage/shared/TableofContent";
import Panel from "./docs.slug.panel";
import {
  fetchChildren,
  fetchMdxContent,
} from "@/components/DocsPage/lib/docs.api";

/* ---------- Dynamic ---------- */
const MainContent = dynamic(
  () => import("@/components/DocsPage/shared/mainContent"),
  { ssr: false },
);

/* ---------- Helper: safe idle callback ---------- */
const ric =
  typeof window !== "undefined" && window.requestIdleCallback
    ? window.requestIdleCallback
    : (cb) => setTimeout(cb, 200);

/* =================================
   Docs Page
================================= */
export default function DocsSlugClient({ slug }) {
  const { theme } = useThemeContext();

  /* ---------- State ---------- */
  const [selectedChild, setSelectedChild] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const scrollRef = useRef(null);
  const sidebarRef = useRef(null);
  const tocRef = useRef(null);

  /* ---------- Queries ---------- */
  const { data: children = [], isError: childrenError } = useQuery({
    queryKey: ["docs", slug],
    queryFn: ({ signal }) => fetchChildren(slug, signal),
    staleTime: 5 * 60 * 1000,
  });

  const { data: mdxData, isError: mdxError } = useQuery({
    queryKey: ["mdx", selectedChild?.filePath],
    queryFn: ({ signal }) => fetchMdxContent(selectedChild?.filePath, signal),
    enabled: !!selectedChild,
    staleTime: 10 * 60 * 1000,
  });

  const mdxContent = mdxData?.content ?? "";
  const frontmatter = mdxData?.frontmatter ?? {};

  /* ---------- Responsive ---------- */
  useEffect(() => {
    const update = () => {
      queueMicrotask(() => {
        const mobile = window.innerWidth < 1024;
        setIsMobile(mobile);
        setSidebarOpen(!mobile);
        setTocOpen(!mobile);
      });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* ---------- Auto select from URL or first child ---------- */
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const childSlugFromUrl = searchParams?.get("child");

  useEffect(() => {
    if (!children.length || selectedChild) return;

    if (childSlugFromUrl) {
      const match = children.find((c) => c.slug === childSlugFromUrl);
      if (match) {
        ric(() => setSelectedChild(match));
        return;
      }
    }

    ric(() => setSelectedChild(children[0]));
  }, [children, selectedChild, childSlugFromUrl]);

  /* ---------- Handle child selection ---------- */
  const handleChildSelect = (child) => {
    queueMicrotask(() => setSelectedChild(child));

    history.replaceState(null, "", `/docs/${slug}?child=${child.slug}`);

    if (isMobile) {
      ric(() => {
        setSidebarOpen(false);
        setTocOpen(false);
      });
    }
  };

  /* ---------- Click outside (mobile) ---------- */
  useEffect(() => {
    if (!isMobile) return;

    const handleClick = (e) => {
      const s = sidebarRef.current;
      const t = tocRef.current;

      if ((s && s.contains(e.target)) || (t && t.contains(e.target))) return;
      if (e.target.closest("button")) return; // ignore toggle button clicks

      ric(() => {
        setSidebarOpen(false);
        setTocOpen(false);
      });
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [isMobile]);

  /* ---------- Error Guards ---------- */
  if (childrenError)
    return (
      <div className="p-10 font-roboto text-crimson">
        Error loading documents cluster.
      </div>
    );
  if (mdxError)
    return (
      <div className="p-10 font-roboto text-crimson">
        Error retrieving document data.
      </div>
    );

  /* ---------- Render ---------- */
  return (
    <div className={`h-dvh transition-colors duration-500 overflow-hidden ${theme === "dark" ? "bg-[#0a0a0a] text-white" : "bg-white text-neutral-900"}`}>
      <div className="flex h-full relative">
        {/* Sidebar */}
        <Panel
          open={sidebarOpen}
          mobile={isMobile}
          side="left"
          panelRef={sidebarRef}
        >
          <Sidebar
            theme={theme}
            children={children}
            selectedChild={selectedChild}
            onChildSelect={handleChildSelect}
          />
        </Panel>

        {/* Main Content */}
        <Suspense fallback={<div className="p-8">Loading…</div>}>
          <MainContent
            scrollRef={scrollRef}
            theme={theme}
            selectedChild={selectedChild}
            mdxContent={mdxContent}
            frontmatter={frontmatter}
            onSidebarToggle={() => setSidebarOpen((v) => !v)}
            onTocToggle={() => setTocOpen((v) => !v)}
          />
        </Suspense>

        {/* TOC */}
        <Panel open={tocOpen} mobile={isMobile} side="right" panelRef={tocRef}>
          <TableOfContent
            theme={theme}
            mdxContent={mdxContent}
            containerRef={scrollRef}
            isMobile={isMobile}
          />
        </Panel>
      </div>
    </div>
  );
}
