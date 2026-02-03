"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useThemeContext } from "@/components/ThemeProvider";

import Sidebar from "@/components/DocsPage/SideBar";
import MainContent from "@/components/DocsPage/mainContent";
import TableOfContent from "@/components/DocsPage/TableofContent";

/* ================================
   Data Fetchers
================================ */
const fetchChildren = async (slug) => {
  const res = await fetch(`/api/docs?parentSlug=${slug}`);
  if (!res.ok) throw new Error("Failed to fetch children");
  return res.json();
};

const fetchMdxContent = async (filePath) => {
  if (!filePath) return null;
  const res = await fetch(
    `/api/github/content?url=${encodeURIComponent(filePath)}`
  );
  if (!res.ok) throw new Error("Failed to fetch MDX content");
  return res.json();
};

/* ================================
   Page
================================ */
export default function DocsSlugPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useThemeContext();

  const currentSlug = pathname.split("/").pop() || "";

  /* ---------- State ---------- */
  const [selectedChild, setSelectedChild] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tocOpen, setTocOpen] = useState(true);
  const [headings, setHeadings] = useState([]);
  const [activeHeadingId, setActiveHeadingId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const mainContentRef = useRef(null);
  const isScrollingRef = useRef(false);

  /* ---------- Queries ---------- */
  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ["docs", "children", currentSlug],
    queryFn: () => fetchChildren(currentSlug),
    staleTime: 5 * 60 * 1000,
  });

  const { data: mdxData, isLoading: mdxLoading } = useQuery({
    queryKey: ["mdx", selectedChild?.filePath],
    queryFn: () => fetchMdxContent(selectedChild?.filePath),
    enabled: !!selectedChild?.filePath,
    staleTime: 10 * 60 * 1000,
  });

  const mdxContent = mdxData?.content || "";
  const loading = childrenLoading || mdxLoading;

  /* ---------- Mount ---------- */
  useEffect(() => setMounted(true), []);

  /* ---------- Responsive ---------- */
  useEffect(() => {
    if (!mounted) return;

    const updateLayout = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
      setTocOpen(!mobile);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [mounted]);

  /* ---------- Auto select first doc ---------- */
  useEffect(() => {
    if (!children.length || selectedChild) return;

    const first =
      children.find(
        (c) =>
          c.nodeType === "file" &&
          (c.filePath?.endsWith(".mdx") || c.fileType === "mdx")
      ) ||
      children.find((c) => c.nodeType === "file") ||
      children[0];

    setSelectedChild(first);
  }, [children, selectedChild]);

  /* ---------- Extract headings ---------- */
  useEffect(() => {
    if (!mdxContent) return;

    const timer = setTimeout(() => {
      const nodes = document.querySelectorAll(
        "h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]"
      );

      setHeadings(
        Array.from(nodes).map((el) => ({
          id: el.id,
          text: el.textContent || "",
          level: Number(el.tagName.replace("H", "")),
        }))
      );
    }, 120);

    return () => clearTimeout(timer);
  }, [mdxContent]);

  /* ---------- Active heading observer ---------- */
  useEffect(() => {
    if (!headings.length || !mainContentRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveHeadingId(e.target.id);
        });
      },
      {
        root: mainContentRef.current,
        rootMargin: "-25% 0px -65% 0px",
        threshold: 0.1,
      }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  /* ---------- Handlers ---------- */
  const handleHeadingClick = (id) => {
    const container = mainContentRef.current;
    const el = document.getElementById(id);
    if (!container || !el) return;

    isScrollingRef.current = true;

    const offset =
      el.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop -
      80;

    container.scrollTo({ top: offset, behavior: "smooth" });
    setActiveHeadingId(id);

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 450);
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
    if (isMobile) setSidebarOpen(false);
  };

  const handleHomeClick = () => router.push("/docs");

  /* ================================
     Render
  ================================ */
  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-zinc-900" : "bg-gray-50"
      }`}
    >
      {/* Mobile Sidebar */}
      {mounted && isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 z-50">
            <Sidebar
              theme={theme}
              children={children}
              selectedChild={selectedChild}
              onChildSelect={handleChildSelect}
              onHomeClick={handleHomeClick}
              isMobile
            />
          </div>
        </div>
      )}

      {/* Mobile TOC */}
      {mounted && isMobile && tocOpen && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setTocOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-72 z-50">
            <TableOfContent
              theme={theme}
              headings={headings}
              activeHeadingId={activeHeadingId}
              onHeadingClick={handleHeadingClick}
              isMobile
            />
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div
          className={`hidden lg:block transition-all duration-300 ${
            sidebarOpen ? "w-72" : "w-0"
          }`}
        >
          {sidebarOpen && (
            <Sidebar
              theme={theme}
              children={children}
              selectedChild={selectedChild}
              onChildSelect={handleChildSelect}
              onHomeClick={handleHomeClick}
            />
          )}
        </div>

        {/* Main */}
        <MainContent
          ref={mainContentRef}
          theme={theme}
          selectedChild={selectedChild}
          mdxContent={mdxContent}
          loading={loading}
          onHomeClick={handleHomeClick}
          onSidebarToggle={() => setSidebarOpen((v) => !v)}
          sidebarOpen={sidebarOpen}
          onTocToggle={() => setTocOpen((v) => !v)}
        />

        {/* TOC */}
        <div
          className={`hidden lg:block transition-all duration-300 ${
            tocOpen ? "w-72" : "w-0"
          }`}
        >
          {tocOpen && (
            <TableOfContent
              theme={theme}
              headings={headings}
              activeHeadingId={activeHeadingId}
              onHeadingClick={handleHeadingClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
