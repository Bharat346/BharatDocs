"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useThemeContext } from "@/components/ThemeProvider";
import Sidebar from "@/components/DocsPage/SideBar";
import MainContent from "@/components/DocsPage/mainContent";
import TableOfContent from "@/components/DocsPage/TableofContent";

const fetchChildren = async (slug) => {
  const response = await fetch(`/api/docs?parentSlug=${slug}`);
  if (!response.ok) throw new Error("Failed to fetch children");
  return response.json();
};

const fetchMdxContent = async (filePath) => {
  if (!filePath) return null;
  const response = await fetch(
    `/api/github/content?url=${encodeURIComponent(filePath)}`,
  );
  if (!response.ok) throw new Error("Failed to fetch MDX content");
  return response.json();
};

export default function DocsSlugPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useThemeContext();
  const currentSlug = pathname.split("/").pop() || "";

  // State
  const [selectedChild, setSelectedChild] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tocOpen, setTocOpen] = useState(true);
  const [headings, setHeadings] = useState([]);
  const [activeHeadingId, setActiveHeadingId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const mainContentRef = useRef(null);

  // Fetch data
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

  // Auto-select first document
  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      const firstMdx = children.find(
        (child) =>
          child.nodeType === "file" &&
          (child.filePath?.includes(".mdx") || child.fileType === "mdx"),
      );
      const firstFile = children.find((child) => child.nodeType === "file");
      setSelectedChild(firstMdx || firstFile || children[0]);
    }
  }, [children, selectedChild]);

  // Set mounted state (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check mobile (client-side only)
  useEffect(() => {
    if (!isMounted) return;

    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setTocOpen(false);
      } else {
        setSidebarOpen(true);
        setTocOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isMounted]);

  // Extract headings
  useEffect(() => {
    const extractHeadings = () => {
      const elements = document.querySelectorAll(
        "h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]",
      );
      const extracted = Array.from(elements).map((el) => ({
        id: el.id,
        text: el.textContent || "",
        level: Number(el.tagName.replace("H", "")),
      }));
      setHeadings(extracted);
    };

    if (mdxContent) {
      const timer = setTimeout(extractHeadings, 100);
      return () => clearTimeout(timer);
    }
  }, [mdxContent]);

  // Intersection Observer for headings
  useEffect(() => {
    if (!headings.length || !mainContentRef.current) return;

    const observer = new IntersectionObserver(
  (entries) => {
    if (isScrollingRef.current) return; // ignore during programmatic scroll
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveHeadingId(entry.target.id);
      }
    });
  },
  {
    root: mainContentRef.current,
    rootMargin: "-20% 0px -70% 0px",
    threshold: 0.1,
  }
);


    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  // Handlers
  const handleChildSelect = (child) => {
    setSelectedChild(child);
    if (isMobile) setSidebarOpen(false);
  };

  const isScrollingRef = useRef(false);

const handleHeadingClick = (id) => {
  const container = mainContentRef.current;
  const element = document.getElementById(id);
  if (!container || !element) return;

  const containerTop = container.getBoundingClientRect().top;
  const elementTop = element.getBoundingClientRect().top;

  const scrollOffset = elementTop - containerTop + container.scrollTop - 80; // header offset

  isScrollingRef.current = true; // disable observer updates

  container.scrollTo({
    top: scrollOffset,
    behavior: "smooth",
  });

  setActiveHeadingId(id);

  // Re-enable observer after scroll completes
  const timeout = setTimeout(() => {
    isScrollingRef.current = false;
  }, 400); // roughly matches smooth scroll duration

  return () => clearTimeout(timeout);
};


  const handleHomeClick = () => router.push("/docs");

  const loading = childrenLoading || mdxLoading;

  // Render desktop layout by default, then adjust on client
  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "bg-zinc-900" : "bg-gray-50"}`}
    >

      {/* Mobile Overlays - only render after mounting */}
      {isMounted && isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
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
              isMobile={true}
            />
          </div>
        </div>
      )}

      {isMounted && isMobile && tocOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
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
              isMobile={true}
            />
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar - always render but conditionally show */}
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

        {/* Main Content */}
        <MainContent
          theme={theme}
          ref={mainContentRef}
          selectedChild={selectedChild}
          mdxContent={mdxContent}
          loading={loading}
          headings={headings}
          activeHeadingId={activeHeadingId}
          onHomeClick={handleHomeClick}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          onTocToggle={() => setTocOpen(!tocOpen)}
          tocOpen={tocOpen}
          isMobile={isMobile}
        />

        {/* Desktop Table of Content - always render but conditionally show */}
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