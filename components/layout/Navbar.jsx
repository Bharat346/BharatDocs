"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, FileText, BookOpen, Newspaper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import NavMobile from "./NavMobile";
import NotificationBell from "@/components/shared/NotificationBell";
import SearchOverlay from "@/components/shared/SearchOverlay";

const NAV_LINKS = [
  { label: "Docs", href: "/docs", icon: FileText },
  { label: "Notes", href: "/notes", icon: BookOpen },
  { label: "Blogs", href: "/blogs", icon: Newspaper },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      
      const isMobile = window.innerWidth < 768;
      const isViewer = pathname.startsWith('/docs/') || pathname.startsWith('/blogs/');
      
      if (isMobile && isViewer) {
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
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") setIsSearchOpen(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
          ? "glass shadow-sm py-0"
          : "bg-[var(--bg-secondary)] py-1"
          } ${isHidden ? "-translate-y-full" : "translate-y-0"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="BharatDocs Logo" className="w-8 h-8" />
            <div className="text-xl font-black uppercase tracking-tighter text-[var(--fg)]">
              BH
              <span className="text-[var(--primary)] group-hover:text-[var(--accent)] transition-colors">
                DOCS
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${isActive
                      ? "text-[var(--primary)] bg-[var(--primary-ghost)]"
                      : "text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-tertiary)]"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <NotificationBell />

            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                bg-[var(--bg-secondary)] border border-[var(--border)]
                text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--border-hover)]
                transition-all"
              id="search-trigger"
            >
              <Search className="w-4 h-4" />
              <span className="text-xs opacity-60">⌘K</span>
            </button>

            <ThemeToggle className="hidden sm:flex" />

            {/* Mobile toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2.5 rounded-xl text-[var(--fg-secondary)] hover:text-[var(--fg)]
                hover:bg-[var(--bg-tertiary)] transition-all"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileOpen && (
        <NavMobile
          links={NAV_LINKS}
          pathname={pathname}
          onClose={() => setIsMobileOpen(false)}
          onSearch={() => { setIsMobileOpen(false); setIsSearchOpen(true); }}
        />
      )}

      {/* Search overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
