"use client";

import { useState, useEffect, useRef } from "react";
import { useThemeContext } from "@/components/ThemeProvider";
import { NAV_ITEMS } from "./nav.config";
import NavLogo from "./nav.logo";
import NavDesktop from "./nav.desk";
import NavMobile from "./nav.mobile";
import { Menu, X, Sun, Moon, Search, Share2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PDFShare from "@/lib/PDF/pdf.share";

export default function NavBar() {
  const { theme, toggleTheme, mounted } = useThemeContext();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchLinkRef = useRef(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setSearchQuery("");
      // Click the hidden Link for instant navigation
      searchLinkRef.current?.click();
    }
  };

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
            ? "bg-black/80 backdrop-blur-lg border-b border-white/10"
            : "bg-white/80 backdrop-blur-lg border-b border-black/5"
          : "bg-transparent"
      } ${isScrolled ? "py-0" : "py-2"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-10">
          <NavLogo theme={theme} />
          <NavDesktop
            navItems={NAV_ITEMS}
            theme={theme}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-gray-800 text-gray-300 hover:text-white"
                : "hover:bg-gray-100 text-gray-600 hover:text-black"
            }`}
            title="Search (Ctrl+K)"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsShareOpen(true)}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-gray-800 text-gray-300 hover:text-white"
                : "hover:bg-gray-100 text-gray-600 hover:text-black"
            }`}
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTheme}
            suppressHydrationWarning
            className={`p-2 rounded-lg transition-colors ${
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
          navItems={NAV_ITEMS}
          theme={theme}
          closeMobile={closeMobile}
        />
      </div>

      {/* Global Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className={`relative z-[201] w-[90%] max-w-2xl rounded-2xl shadow-2xl overflow-hidden border ${
                theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"
              }`}
            >
              <form onSubmit={handleSearchSubmit} className="flex items-center p-4 sm:p-5">
                <Search className={`w-6 h-6 mr-4 ${theme === "dark" ? "text-zinc-500" : "text-gray-400"}`} />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search documentation, notes, and topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`flex-1 text-lg sm:text-xl font-medium outline-none bg-transparent ${
                    theme === "dark" ? "text-white placeholder:text-zinc-500" : "text-black placeholder:text-gray-400"
                  }`}
                />
                {/* Hidden Link for instant navigation */}
                <Link
                  ref={searchLinkRef}
                  href={`/search?q=${encodeURIComponent(searchQuery)}`}
                  className="hidden"
                  tabIndex={-1}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className={`ml-4 p-1 rounded-md transition-colors ${
                    theme === "dark" ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isShareOpen && (
        <PDFShare
          theme={theme}
          title={typeof document !== "undefined" ? document.title : "Research Hub"}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </nav>
  );
}
