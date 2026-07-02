"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, FileText, Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function SidebarNode({ node, level, pathname }) {
  const isPdf = node.fileType === 'pdf';
  // If node is pdf, we route to the new proxy endpoint /pdf/[...slug] which handles streaming it
  const targetHref = isPdf ? `/pdf/${node.fullSlug || node.slug}` : `/docs/${node.fullSlug || node.slug}`;
  const isActive = pathname === targetHref || pathname === `/docs/${node.fullSlug || node.slug}`;
  
  const [isExpanded, setIsExpanded] = useState(() => pathname.includes(node.slug));

  useEffect(() => {
    const saved = localStorage.getItem(`sidebar_expanded_${node.id}`);
    if (saved !== null) {
      setIsExpanded(saved === 'true');
    } else if (pathname.includes(node.slug)) {
      setIsExpanded(true);
    }
  }, [pathname, node.slug, node.id]);

  const toggleExpand = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`sidebar_expanded_${node.id}`, nextState);
    }
  };

  if (node.type === "document") {
    return (
      <Link
        href={targetHref}
        target={isPdf ? "_blank" : undefined}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
          isActive
            ? "text-[var(--primary)] font-bold bg-[var(--primary-ghost)]"
            : "text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-tertiary)]"
        }`}
        style={{ marginLeft: `${level * 12}px` }}
      >
        <FileText className="w-4 h-4 opacity-70 flex-shrink-0" />
        <span className="truncate flex-1">{node.name}</span>
        {isPdf && <span className="text-[9px] uppercase font-mono text-red-500 bg-red-500/10 px-1 rounded flex-shrink-0">PDF</span>}
      </Link>
    );
  }

  // Folder
  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm transition-colors cursor-pointer group ${
          isActive || (pathname.includes(node.slug) && !isExpanded)
            ? "text-[var(--fg)] font-bold"
            : "text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-tertiary)]"
        }`}
        style={{ marginLeft: `${level * 12}px` }}
        onClick={toggleExpand}
      >
        <button className="p-0.5 rounded hover:bg-[var(--border)] transition-colors">
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5 opacity-60" /> : <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
        </button>
        <Link href={targetHref} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 flex-1 truncate group-hover:text-[var(--fg)]">
          <Folder className={`w-4 h-4 flex-shrink-0 transition-opacity ${isActive ? "fill-[var(--primary)]/20 text-[var(--primary)] opacity-100" : "opacity-70 group-hover:opacity-100"}`} />
          <span className="truncate">{node.name}</span>
        </Link>
      </div>
      
      <AnimatePresence initial={false}>
        {isExpanded && node.children && node.children.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden flex flex-col gap-0.5 mt-0.5 relative"
          >
            <div className="absolute left-[18px] top-0 bottom-0 w-px bg-[var(--border)] opacity-50" />
            {node.children.map(child => (
              <SidebarNode key={child.id} node={child} level={level + 1} pathname={pathname} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DocSidebar({ docs = [] }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const isMobile = window.innerWidth < 1024;
      
      if (isMobile) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
          setIsHidden(true);
        } else if (currentScrollY < lastScrollY.current) {
          setIsHidden(false);
        }
      } else {
        setIsHidden(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tree = useMemo(() => {
    if (!docs.length) return [];
    
    const map = {};
    docs.forEach(doc => {
      map[doc.id] = { ...doc, children: [] };
    });

    const roots = [];
    docs.forEach(doc => {
      if (doc.parentId && map[doc.parentId]) {
        map[doc.parentId].children.push(map[doc.id]);
      } else {
        roots.push(map[doc.id]);
      }
    });
    
    const sortTree = (nodes) => {
      nodes.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return (a.orderIndex || 0) - (b.orderIndex || 0);
      });
      nodes.forEach(n => sortTree(n.children));
    };
    sortTree(roots);
    
    const assignFullSlug = (nodes, currentPath) => {
      nodes.forEach(node => {
        node.fullSlug = currentPath ? `${currentPath}/${node.slug}` : node.slug;
        assignFullSlug(node.children, node.fullSlug);
      });
    };
    assignFullSlug(roots, "");

    return roots;
  }, [docs]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] border-r border-[var(--border)] overflow-y-auto no-scrollbar py-6 px-4">
      
      <Link
        href="/docs"
        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all mb-4 ${
          pathname === "/docs"
            ? "text-[var(--primary)] bg-[var(--primary-ghost)]"
            : "text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-tertiary)]"
        }`}
      >
        <Folder className="w-4 h-4" />
        <span className="truncate">All Documentation</span>
      </Link>

      <div className="flex flex-col gap-1">
        {tree.map(node => (
          <SidebarNode key={node.id} node={node} level={0} pathname={pathname} />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-72 flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        <SidebarContent />
      </aside>

      <div className={`lg:hidden sticky z-[90] bg-[var(--bg-secondary)] border-b border-[var(--border)] p-2 flex items-center shadow-sm transition-all duration-300 top-16 ${isHidden ? "-translate-y-[calc(100%+4rem)] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--fg)] bg-[var(--bg-tertiary)] hover:bg-[var(--border)] transition-colors"
        >
          <Menu className="w-4 h-4" />
          Navigation menu
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[var(--bg)]/80 backdrop-blur-sm z-[150] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[80%] max-w-sm bg-[var(--bg-secondary)] z-[160] lg:hidden shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <span className="font-bold text-[var(--fg)]">Navigation</span>
                <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-tertiary)] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <SidebarContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
