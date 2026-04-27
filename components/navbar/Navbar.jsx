"use client";

import { useState, useEffect, useRef } from "react";
import { useThemeContext } from "@/components/ThemeProvider";
import { NAV_ITEMS } from "./nav.config";
import NavLogo from "./nav.logo";
import NavDesktop from "./nav.desk";
import NavMobile from "./nav.mobile";
import { Menu, X, Sun, Moon, Search, Share2, FileText, BookOpen } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ShareDropdown from "@/components/DocsPage/shared/ShareDropdown";
import SearchOverlay from "@/components/ui/search-overlay";

export default function NavBar() {
  const { theme, toggleTheme, mounted } = useThemeContext();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dynamicNavItems, setDynamicNavItems] = useState(NAV_ITEMS);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await fetch("/api/docs?collection=Docs");
        if (res.ok) {
          const data = await res.json();
          const docItems = data.map((doc) => ({
            label: doc.name,
            href: `/docs/${doc.slug}`,
            icon: FileText,
          }));

          setDynamicNavItems((prev) =>
            prev.map((item) =>
              item.label === "Documents"
                ? {
                    ...item,
                    children: [
                      { label: "All Documents", href: "/docs", icon: BookOpen },
                      ...docItems,
                    ],
                  }
                : item,
            ),
          );
        }
      } catch (err) {
        console.error("Failed to fetch docs for navbar:", err);
      } finally {
        setIsLoadingDocs(false);
      }
    }
    fetchDocs();
  }, []);

  const [isSearchOpen, setIsSearchOpen] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    const handleKeyDown = (e) => {
      // Ctrl + Shift + F shortcut
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }

      // Close search on Escape
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    <nav
      suppressHydrationWarning
      className={`fixed top-0 left-0 right-0 z-150 transition-all duration-300 ${
        isScrolled
          ? theme === "dark"
            ? "bg-[#18181b]/80 backdrop-blur-lg border-b border-white/10"
            : "bg-white/80 backdrop-blur-lg border-b border-black/5"
          : "bg-transparent"
      } ${isScrolled ? "py-0" : "py-2"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-10">
          <NavLogo theme={theme} />
          <NavDesktop
            navItems={dynamicNavItems}
            theme={theme}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2.5 rounded-xl transition-all flex bg-secondary-bg border border-border/50 text-neutral-500 hover:text-primary hover:border-primary/30"
            title="Search (Ctrl+K)"
          >
            <Search className="w-5 h-5" />
          </button>

          <ShareDropdown 
            title={typeof document !== "undefined" ? document.title : "BharatDocs"} 
            url={typeof window !== "undefined" ? window.location.href : ""} 
          />

          <button
            onClick={toggleTheme}
            suppressHydrationWarning
            className={`p-2 rounded-lg transition-colors hidden lg:flex ${
              theme === "dark"
                ? "hover:bg-gray-800 text-yellow-400"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )
            ) : (
              <div className="h-5 w-5" /> // Placeholder
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        <NavMobile
          isOpen={isMobileMenuOpen}
          navItems={dynamicNavItems}
          theme={theme}
          toggleTheme={toggleTheme}
          closeMobile={closeMobile}
        />
      </div>

      {/* Global Search Modal */}
      <SearchOverlay isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} theme={theme} />


    </nav>
  );
}
