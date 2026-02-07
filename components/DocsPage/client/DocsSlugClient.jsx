"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useThemeContext } from "@/components/ThemeProvider";
import Sidebar from "@/components/DocsPage/SideBar";
import TableOfContent from "@/components/DocsPage/TableofContent";
import { useQuery } from "@tanstack/react-query";

/* ---------- Dynamic ---------- */
const MainContent = dynamic(
  () => import("@/components/DocsPage/mainContent"),
  { ssr: false }
);

/* ---------- Fetchers ---------- */
const fetchChildren = async (slug) => {
  const res = await fetch(`/api/docs?parentSlug=${slug}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
};

const fetchMdxContent = async (filePath) => {
  if (!filePath) return null;
  const res = await fetch(
    `/api/github/content?url=${encodeURIComponent(filePath)}`
  );
  if (!res.ok) throw new Error("Failed");
  return res.json();
};

/* =================================
   Docs Page
================================= */
export default function DocsSlugClient({ slug }) {
  const { theme } = useThemeContext();

  const [selectedChild, setSelectedChild] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const scrollRef = useRef(null);
  const sidebarRef = useRef(null);
  const tocRef = useRef(null);

  /* ---------- Queries ---------- */
  const { data: children = [] } = useQuery({
    queryKey: ["docs", slug],
    queryFn: () => fetchChildren(slug),
    staleTime: 5 * 60 * 1000,
  });

  const { data: mdxData } = useQuery({
    queryKey: ["mdx", selectedChild?.filePath],
    queryFn: () => fetchMdxContent(selectedChild?.filePath),
    enabled: !!selectedChild,
    staleTime: 10 * 60 * 1000,
  });

  const mdxContent = mdxData?.content ?? "";
  const frontmatter = mdxData?.frontmatter ?? {};

  /* ---------- Responsive ---------- */
  useEffect(() => {
    const update = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
      setTocOpen(!mobile);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* ---------- Auto select ---------- */
  useEffect(() => {
    if (!children.length || selectedChild) return;
    setSelectedChild(children[0]);
  }, [children, selectedChild]);

  /* ---------- FAST select ---------- */
  const handleChildSelect = (child) => {
    setSelectedChild(child);

    history.replaceState(
      null,
      "",
      `/docs/${slug}?child=${child.slug}`
    );

    if (isMobile) {
      setSidebarOpen(false);
      setTocOpen(false);
    }
  };

  /* ---------- Click outside (mobile only) ---------- */
  useEffect(() => {
    if (!isMobile) return;

    const handleClick = (e) => {
      const s = sidebarRef.current;
      const t = tocRef.current;

      if (
        (s && s.contains(e.target)) ||
        (t && t.contains(e.target))
      ) {
        return;
      }

      setSidebarOpen(false);
      setTocOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [isMobile]);

  /* ================================= */
  return (
    <div
      className={`h-dvh ${
        theme === "dark" ? "bg-zinc-900" : "bg-gray-50"
      }`}
    >
      <div className="flex h-full overflow-hidden relative">
        {/* ---------- Sidebar ---------- */}
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

        {/* ---------- Main ---------- */}
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

        {/* ---------- TOC ---------- */}
        <Panel
          open={tocOpen}
          mobile={isMobile}
          side="right"
          panelRef={tocRef}
        >
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

/* =================================
   Panel Component
================================= */
function Panel({ open, mobile, side, panelRef, children }) {
  if (!open) return null;

  /* ---------- Mobile Overlay ---------- */
  if (mobile) {
    return (
      <div
        ref={panelRef}
        className={`fixed inset-y-0 ${
          side === "right" ? "right-0" : "left-0"
        } z-40 w-72 bg-background shadow-xl`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    );
  }

  /* ---------- Desktop ---------- */
  return (
    <aside className="hidden lg:block w-72 h-full">
      {children}
    </aside>
  );
}
