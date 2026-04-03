"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { useThemeContext } from "@/components/ThemeProvider";
import DocsNavBar from "@/components/DocsPage/shared/DocsNavBar";
import Sidebar from "@/components/DocsPage/shared/SideBar";
import TableOfContent from "@/components/DocsPage/shared/TableofContent";
import Panel from "./docs.slug.panel";
import { fetchChildren, fetchMdxContent } from "@/components/DocsPage/lib/docs.api";
import { Loader2, FileSearch, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Portal from "@/components/ui/portal";

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
  const { theme, toggleTheme, mounted } = useThemeContext();

  /* ---------- State ---------- */
  const [selectedChild, setSelectedChild] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const scrollRef = useRef(null);
  const sidebarRef = useRef(null);
  const tocRef = useRef(null);

  /* ---------- Queries ---------- */
  const { data: children = [], isError: childrenError, isLoading: isLoadingChildren } = useQuery({
    queryKey: ["docs", slug],
    queryFn: ({ signal }) => fetchChildren(slug, signal),
    staleTime: 5 * 60 * 1000,
  });

  const { data: mdxData, isError: mdxError, isLoading: isLoadingMdx } = useQuery({
    queryKey: ["mdx", selectedChild?.filePath],
    queryFn: ({ signal }) => fetchMdxContent(selectedChild?.filePath, signal),
    enabled: !!selectedChild,
    staleTime: 60 * 60 * 1000,
  });

  const mdxContent = mdxData?.content ?? "";
  const frontmatter = mdxData?.frontmatter ?? {};

  /* ---------- Search Toggle ---------- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      if (e.target.closest("button")) return; 

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
      <div className="flex flex-col items-center justify-center min-h-screen p-10 font-roboto text-crimson bg-background text-center">
        <FileSearch className="w-12 h-12 mb-4 opacity-50" />
        <h2 className="text-xl font-bold mb-2">Error Loading Cluster</h2>
        <p className="text-zinc-500">We couldn't retrieve the document structure. Please try again later.</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Reload Page</button>
      </div>
    );

  /* ---------- Render ---------- */
  return (
    <div className={`h-screen flex flex-col transition-colors duration-500 overflow-hidden ${theme === "dark" ? "bg-[#0a0a0a] text-white" : "bg-white text-neutral-900"}`}>
      {/* Professional Doc NavBar */}
      <DocsNavBar theme={theme} toggleTheme={toggleTheme} mounted={mounted} setIsSearchOpen={setIsSearchOpen} />

      <div className="flex flex-1 relative overflow-hidden h-full">
        {/* Sidebar */}
        <Panel
          open={sidebarOpen}
          mobile={isMobile}
          side="left"
          panelRef={sidebarRef}
        >
          <div className="h-full border-r border-zinc-200 dark:border-zinc-800/60 w-72 flex flex-col overflow-hidden bg-background">
            <Sidebar
              theme={theme}
              children={children}
              selectedChild={selectedChild}
              onChildSelect={handleChildSelect}
            />
          </div>
        </Panel>

        {/* Main Content Area */}
        <div className="flex-1 relative flex flex-col min-w-0 bg-background overflow-hidden h-full">
          {isLoadingChildren || (selectedChild && isLoadingMdx) ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-sm font-medium text-zinc-500 animate-pulse">Initializing documentation...</p>
            </div>
          ) : !selectedChild && !isLoadingChildren ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800/50 rounded-3xl flex items-center justify-center mb-6">
                <FileSearch className="w-10 h-10 text-zinc-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3">No document found</h2>
              <p className="text-zinc-500 leading-relaxed">
                The document cluster exists, but no specific page is currently available for display.
              </p>
            </div>
          ) : (
            <Suspense fallback={
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500/50 animate-spin" />
              </div>
            }>
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
          )}
        </div>

        {/* TOC */}
        <Panel open={tocOpen} mobile={isMobile} side="right" panelRef={tocRef}>
          <div className="h-full border-l border-zinc-200 dark:border-zinc-800/60 w-64 bg-background overflow-hidden flex flex-col">
          <TableOfContent
            theme={theme}
            mdxContent={mdxContent}
            containerRef={scrollRef}
            isMobile={isMobile}
          />
          </div>
        </Panel>
      </div>

      {/* GLOBAL SEARCH OVERLAY (Root Level Fix) */}
      <Portal>
        <AnimatePresence>
          {isSearchOpen && (
            <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={() => setIsSearchOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className={`relative z-[1001] w-[90%] max-w-2xl rounded-3xl shadow-2xl overflow-hidden border ${
                  theme === "dark" ? "bg-zinc-950 border-zinc-800" : "bg-white border-gray-200"
                } ring-1 ring-blue-500/10 shadow-blue-500/5`}
              >
                <form action="/search" method="GET" className="flex items-center p-5">
                  <Search className={`w-6 h-6 mr-4 ${theme === "dark" ? "text-zinc-500" : "text-gray-400"}`} />
                  <input
                    type="text"
                    name="q"
                    autoFocus
                    placeholder="Search documentation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    required
                    className={`flex-1 text-lg sm:text-xl font-medium outline-none bg-transparent ${
                      theme === "dark" ? "text-white placeholder:text-zinc-600" : "text-black placeholder:text-gray-400"
                    }`}
                  />
                  <button type="button" onClick={() => setIsSearchOpen(false)} className={`ml-4 p-2 rounded-xl transition-colors ${theme === "dark" ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-gray-100 text-gray-400"}`}>
                    <span className="text-[10px] font-mono px-2 py-1 rounded border border-zinc-700 bg-zinc-800 text-zinc-300">ESC</span>
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Portal>
    </div>
  );
}
