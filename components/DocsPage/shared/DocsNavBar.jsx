"use client";

import { Search, Sun, Moon, ArrowLeft, Menu, Layers } from "lucide-react";
import Link from "next/link";
import ShareDropdown from "@/components/DocsPage/shared/ShareDropdown";

export default function DocsNavBar({
  mounted,
  toggleTheme,
  theme,
  setIsSearchOpen,
  docTitle,
  onMenuClick,
}) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const title = typeof document !== "undefined" ? document.title : "Research Hub";

  return (
    <nav className="h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-[100] transition-colors duration-300 bg-background/80 backdrop-blur-md border-b border-border/60">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="p-2.5 rounded-xl lg:hidden transition-all bg-secondary-bg border border-border/50 text-neutral-500 hover:text-primary hover:border-primary/30"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>


        <Link
          href="/docs"
          className="p-2.5 rounded-xl transition-all hidden sm:flex bg-secondary-bg border border-border/50 text-neutral-500 hover:text-primary hover:border-primary/30"
          title="Back to Docs"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-bold text-lg sm:text-xl tracking-tight max-w-[150px] sm:max-w-none truncate">
            {docTitle || "BharatDocs"}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end sm:justify-center px-2 sm:px-4">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="group flex items-center justify-center sm:justify-start gap-3 p-2 sm:px-4 sm:py-2 rounded-xl sm:border transition-all w-auto sm:w-full max-w-md bg-secondary-bg border-border hover:border-primary/30 text-neutral-500 hover:text-primary sm:shadow-sm"
          title="Search"
        >
          <Search className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline text-sm font-medium mr-auto">
            Search documentation...
          </span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-white px-1.5 font-mono text-[10px] font-medium text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <div className="hidden sm:flex">
          <ShareDropdown title={title} url={url} />
        </div>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl transition-all hidden sm:flex bg-secondary-bg border border-border/50 text-neutral-500 hover:text-primary hover:border-primary/30"
        >
          {mounted ? (
            theme === "dark" ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />
          ) : (
            <div className="h-5 w-5" />
          )}
        </button>
      </div>



    </nav>
  );
}
