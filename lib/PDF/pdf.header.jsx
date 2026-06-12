"use client";

import Link from "next/link";
import {
  ChevronLeft,
  Share2,
  Download,
  PanelsTopLeft,
  Search,
  Sun,
  Moon,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import SearchOverlay from "@/components/ui/search-overlay";
import ShareDropdown from "@/components/DocsPage/shared/ShareDropdown";

export default function PDFHeader({
  title,
  backHref = "/notes",
  onDownload,
  onShare,
  onToggleSidebar,
  theme,
  toggleTheme,
  mounted,
}) {

  const isDark = theme === "dark";
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut Ctrl+K to open search, similar to Navbar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <nav
        id="pdf-navbar"
        className={`
          h-[52px] w-full flex items-center justify-between px-3 sm:px-4 
          z-[10005] border-b transition-colors duration-200 flex-shrink-0
          ${
            isDark
              ? "bg-[#0a0a0a]/95 border-zinc-800/80 backdrop-blur-xl"
              : "bg-white/95 border-gray-200/80 backdrop-blur-xl"
          }
        `}
      >
        {/* LEFT: Sidebar Toggle + Back + Title */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 min-w-0 flex-1">

          <Link
            href={backHref}
            className="p-2.5 rounded-xl transition-all bg-secondary-bg border border-border/50 text-neutral-500 hover:text-primary hover:border-primary/30"
            title="Go Back"
          >
            <ChevronLeft size={19} strokeWidth={2} />
          </Link>


          <div
            className={`h-5 w-px mx-1 hidden sm:block ${
              isDark ? "bg-white/[0.06]" : "bg-gray-200"
            }`}
          />

          <div className="flex items-center gap-2 min-w-0">
            <h1
              className={`text-sm font-semibold truncate max-w-[120px] sm:max-w-[240px] leading-tight ${
                isDark ? "text-zinc-300" : "text-gray-800"
              }`}
              title={title}
            >
              {title || "Untitled Document"}
            </h1>
          </div>
        </div>

        {/* CENTER: Universal Search Trigger (matches docs viewer style) */}
        <div className="hidden md:flex items-center flex-1 justify-center px-4 max-w-md mx-auto">
          <button
            onClick={() => setIsSearchOpen(true)}
            className={`
              w-full flex items-center justify-between rounded-xl border px-3 py-[7px] transition-all duration-200
              ${
                isDark
                  ? "bg-zinc-900/40 border-white/[0.06] hover:border-white/10 text-zinc-500"
                  : "bg-gray-50/80 border-gray-200/60 hover:border-gray-300 text-gray-600"
              }

            `}
          >
            <div className="flex items-center gap-3">
              <Search className="w-3.5 h-3.5" />
              <span className="text-sm font-medium">Search...</span>
            </div>

            <kbd
              className={`
              text-xs font-bold px-1.5 py-0.5 rounded-md 
              tracking-wider uppercase pointer-events-none
              ${
                isDark
                  ? "bg-zinc-800 text-zinc-600 border border-zinc-700/50"
                  : "bg-white text-gray-500 border border-gray-200 shadow-sm"
              }

            `}
            >
              ⌘K
            </kbd>
          </button>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-0.5 flex-1 justify-end">
          <button
            onClick={() => setIsSearchOpen(true)}
            className={`p-2 rounded-lg transition-all duration-150 md:hidden ${
              isDark
                ? "hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-200"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"

            }`}
            title="Universal Search (Ctrl+K)"
          >
            <Search size={17} strokeWidth={1.8} />
          </button>

          <ShareDropdown 
            title={title || "BharatDocs PDF"} 
            url={typeof window !== "undefined" ? window.location.href : ""} 
          />


          <button 
            onClick={onDownload}
            className="p-2.5 rounded-xl transition-all hidden sm:flex bg-secondary-bg border border-border/50 text-neutral-500 hover:text-primary hover:border-primary/30 mx-1"
            title="Download PDF"
          >
            <Download size={19} strokeWidth={2} />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl transition-all flex bg-secondary-bg border border-border/50 text-neutral-500 hover:text-primary hover:border-primary/30"
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {mounted ? (
              isDark ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5" />
              )
            ) : (
              <div className="h-5 w-5" />
            )}
          </button>
        </div>

      </nav>

      <SearchOverlay
        isOpen={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        theme={theme}
      />
    </>
  );
}
