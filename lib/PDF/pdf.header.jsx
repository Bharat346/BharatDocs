"use client";

import { ChevronLeft, Share2, Download, PanelsTopLeft } from "lucide-react";

export default function PDFHeader({ 
  title, 
  onBack, 
  onDownload, 
  onShare,
  onToggleSidebar,
  theme 
}) {
  const isDark = theme === "dark";

  return (
    <nav className={`h-14 w-full flex items-center justify-between px-4 z-[10005] border-b ${
      isDark 
        ? "bg-zinc-900 border-white/5 shadow-2xl" 
        : "bg-white border-gray-200 shadow-sm"
    }`}>
      <div className="flex items-center gap-1 sm:gap-3 font-inter min-w-0">
        <button 
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition ${
            isDark ? "hover:bg-white/5 text-zinc-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
          }`}
          title="Toggle Sidebar"
        >
          <PanelsTopLeft size={18} />
        </button>
        <button 
          onClick={onBack}
          className={`p-2 rounded-lg transition ${
            isDark ? "hover:bg-white/5 text-zinc-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
          }`}
          title="Go Back"
        >
          <ChevronLeft size={18} />
        </button>
        <span className={`hidden sm:block h-5 w-px mx-1 ${isDark ? "bg-white/10" : "bg-gray-200"}`}></span>
        <h1 className={`text-xs sm:text-sm font-bold truncate pr-4 ${
          isDark ? "text-zinc-200" : "text-gray-900"
        }`}>
          {title || "Untitled Document"}
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <button 
          onClick={onShare}
          className={`p-2 rounded-lg transition hidden md:flex ${
            isDark ? "hover:bg-white/5 text-zinc-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
          }`}
          title="Share Link"
        >
          <Share2 size={18} />
        </button>
        <button 
          onClick={onDownload}
          className={`p-2 rounded-lg transition ${
            isDark ? "hover:bg-white/5 text-zinc-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
          }`}
          title="Download PDF"
        >
          <Download size={18} />
        </button>
      </div>
    </nav>
  );
}
