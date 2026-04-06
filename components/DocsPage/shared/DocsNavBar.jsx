"use client";

import { Search, Share2, Sun, Moon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import PDFShare from "@/lib/PDF/pdf.share";

export default function DocsNavBar({ theme, toggleTheme, mounted, setIsSearchOpen }) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <nav className={`h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-[100] transition-colors duration-300 ${
      theme === "dark" 
        ? "bg-[#0a0a0a]/80 backdrop-blur-md" 
        : "bg-white/80 backdrop-blur-md"
    }`}>
      <div className="flex items-center gap-4">
        <Link 
          href="/"
          className={`p-2 rounded-lg transition-colors ${
            theme === "dark" ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-black"
          }`}
          title="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/icon.png" alt="Logo" className="w-7 h-7 object-contain" />
          <span className="font-bold text-xl tracking-tight hidden sm:block">
            Bharat<span className="text-blue-600">Docs</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-2xl justify-end sm:justify-center px-4">
        <button
          onClick={() => setIsSearchOpen(true)}
          className={`group flex items-center gap-3 px-4 py-2 rounded-xl border transition-all w-full max-w-md ${
            theme === "dark" 
              ? "bg-zinc-900/50 border-zinc-800 hover:border-blue-500/50 text-zinc-500" 
              : "bg-gray-50 border-gray-100 hover:border-blue-500/30 text-gray-400 shadow-sm"
          }`}
        >
          <Search className="w-4 h-4" />
          <span className="text-sm font-medium mr-auto">Search documentation...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-1.5 font-mono text-[10px] font-medium text-zinc-400 opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setIsShareOpen(true)}
          className={`p-2 rounded-lg transition-colors ${
            theme === "dark" ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-black"
          }`}
          title="Share"
        >
          <Share2 className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors hidden sm:flex ${
            theme === "dark" ? "hover:bg-zinc-800 text-yellow-400" : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          {mounted ? (
            theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
          ) : (
            <div className="h-5 w-5" />
          )}
        </button>
      </div>

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
