"use client";

import Link from "next/link";
import { ChevronLeft, Share2, Download, PanelsTopLeft, Search, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchOverlay from "@/components/ui/search-overlay";

export default function PDFHeader({ 
  title, 
  backHref = "/notes", 
  onDownload, 
  onShare,
  onToggleSidebar,
  theme,
  toggleTheme,
  mounted
}) {
  const isDark = theme === "dark";
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <nav className={`h-14 w-full flex items-center justify-between px-4 z-[10005] border-b transition-colors duration-300 ${
      isDark 
        ? "bg-[#0a0a0a] border-zinc-800 shadow-2xl" 
        : "bg-white border-gray-200 shadow-sm"
    }`}>
      <div className="flex items-center gap-1 sm:gap-3 font-inter min-w-0 flex-1">
        <button 
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition ${
            isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
          }`}
          title="Toggle Sidebar"
        >
          <PanelsTopLeft size={18} />
        </button>
        <Link 
          href={backHref}
          className={`p-2 rounded-lg transition ${
            isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
          }`}
          title="Go Back"
        >
          <ChevronLeft size={18} />
        </Link>
        <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />
        <h1 className={`text-xs sm:text-sm font-bold truncate max-w-[200px] ${
          isDark ? "text-zinc-200" : "text-gray-900"
        }`}>
          {title || "Untitled Document"}
        </h1>
      </div>

      <div className="hidden md:flex items-center gap-4 flex-1 justify-center px-4">
        <button
          onClick={() => setIsSearchOpen(true)}
          className={`group flex items-center gap-3 px-4 py-1.5 rounded-lg border transition-all w-full max-w-sm ${
            isDark 
              ? "bg-zinc-900/50 border-zinc-800 text-zinc-500" 
              : "bg-gray-50 border-gray-100 text-gray-400"
          }`}
        >
          <Search className="w-4 h-4" />
          <span className="text-xs font-medium mr-auto">Universal Search...</span>
        </button>
      </div>

      <div className="flex items-center gap-1 flex-1 justify-end">
        <button 
          onClick={onShare}
          className={`p-2 rounded-lg transition ${
            isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
          }`}
          title="Share Link"
        >
          <Share2 size={18} />
        </button>

        <button 
          onClick={onDownload}
          className={`p-2 rounded-lg transition hidden sm:flex ${
            isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
          }`}
          title="Download PDF"
        >
          <Download size={18} />
        </button>

        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? "hover:bg-zinc-800 text-yellow-400" : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          {mounted ? (
            isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
          ) : (
            <div className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Global Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} theme={theme} />
    </nav>
  );
}
