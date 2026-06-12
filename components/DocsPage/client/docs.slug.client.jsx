"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useThemeContext } from "@/components/ThemeProvider";
import DocsNavBar from "@/components/DocsPage/shared/DocsNavBar";
import Sidebar from "@/components/DocsPage/shared/SideBar";
import TableOfContent from "@/components/DocsPage/shared/TableofContent";
import Panel from "./docs.slug.panel";
import BharatLoader from "@/components/ui/loader";
import { FileSearch } from "lucide-react";
import SearchOverlay from "@/components/ui/search-overlay";
import { useUserProfileStore } from "@/hooks/useUserProfile";

import { getFromCache, setToCache, STORES } from "@/lib/idb.cache";

/* ---------- Dynamic ---------- */
const MainContent = dynamic(
  () => import("@/components/DocsPage/shared/mainContent"),
  { ssr: true },
);

/* =================================
   Docs Page
 ================================= */
export default function DocsSlugClient({
  slug,
  initialChildren,
  initialSelectedChild,
  initialMdxResult,
}) {
  const { theme, toggleTheme, mounted } = useThemeContext();
  const searchParams = useSearchParams();

  /* ---------- State ---------- */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const scrollRef = useRef(null);
  const sidebarRef = useRef(null);
  const tocRef = useRef(null);

  const children = initialChildren || [];
  const selectedChild = initialSelectedChild;

  // Use state to allow hydration
  const [mdxContent, setMdxContent] = useState(initialMdxResult?.content ?? "");
  const frontmatter = initialMdxResult?.frontmatter ?? {};
  const headings = initialMdxResult?.headings ?? [];

  const addActivity = useUserProfileStore((state) => state.addActivity);

  useEffect(() => {
    if (selectedChild) {
      addActivity({
        type: "read",
        title: frontmatter?.title || selectedChild.name,
        url: `/docs/${slug}?child=${selectedChild.slug}`,
      });
    }
  }, [selectedChild, frontmatter, slug, addActivity]);

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
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
        setTocOpen(true);
      }
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* ---------- Handle child selection ---------- */
  const handleChildSelect = () => {
    if (isMobile) {
      setSidebarOpen(false);
      setTocOpen(false);
    }
  };

  /* ---------- Click outside (mobile) ---------- */
  useEffect(() => {
    if (!isMobile) return;

    const handleClick = (e) => {
      const s = sidebarRef.current;
      const t = tocRef.current;
      if ((s && s.contains(e.target)) || (t && t.contains(e.target))) return;
      if (e.target.closest("button") || e.target.closest("a")) return;

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

  return (
    <div className="h-screen flex flex-col transition-colors duration-500 overflow-hidden bg-background text-foreground">
      {/* Professional Doc NavBar */}
      <DocsNavBar
        theme={theme}
        toggleTheme={toggleTheme}
        mounted={mounted}
        setIsSearchOpen={setIsSearchOpen}
        docTitle={
          frontmatter?.title || slug.split("/").pop()?.replace(/[-_]/g, " ")
        }
        onMenuClick={() => setSidebarOpen((v) => !v)}
        onTocClick={() => setTocOpen((v) => !v)}
      />

      <div className="flex flex-1 relative overflow-hidden h-full">
        {/* Sidebar */}
        <Panel
          open={sidebarOpen}
          mobile={isMobile}
          side="left"
          panelRef={sidebarRef}
        >
          <div className="h-full w-72 flex flex-col overflow-hidden bg-secondary-bg/30 backdrop-blur-xl border-r border-border/50">
            <Sidebar
              children={children}
              selectedChild={selectedChild}
              onChildSelect={handleChildSelect}
              slug={slug}
            />
          </div>
        </Panel>

        {/* Main Content Area */}
        <div className="flex-1 relative flex flex-col min-w-0 bg-background overflow-hidden h-full">
          {!selectedChild ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-secondary-bg/50 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-border/50">
                <FileSearch className="w-10 h-10 text-primary/50" />
              </div>
              <h2 className="text-2xl font-bold mb-3">No document found</h2>
              <p className="text-zinc-500 leading-relaxed">
                The document cluster exists, but no specific page is currently
                available for display.
              </p>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="flex-1 flex items-center justify-center">
                  <BharatLoader fullScreen={false} />
                </div>
              }
            >
              <MainContent
                scrollRef={scrollRef}
                selectedChild={selectedChild}
                mdxContent={mdxContent}
              />
            </Suspense>
          )}
        </div>

        {/* TOC */}
        {!isMobile && (
          <Panel open={tocOpen} mobile={false} side="right" panelRef={tocRef}>
            <div className="h-full w-32 bg-transparent flex flex-col items-center">
              <TableOfContent
                headings={headings}
                containerRef={scrollRef}
                isMobile={false}
              />
            </div>
          </Panel>
        )}
      </div>

      {/* GLOBAL SEARCH OVERLAY */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        theme={theme}
      />
    </div>
  );
}
