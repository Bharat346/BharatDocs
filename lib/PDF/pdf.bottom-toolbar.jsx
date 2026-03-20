"use client";

import { ChevronLeft, ChevronRight, Minus, Plus, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function PDFBottomToolbar({ 
  isDark,
  currentPage,
  totalPages,
  scale,
  onPreviousPage,
  onNextPage,
  onJumpToPage,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onHelp
}) {
  const [pageInput, setPageInput] = useState(String(currentPage + 1));

  useEffect(() => {
    setPageInput(String(currentPage + 1));
  }, [currentPage]);

  const commitPage = () => {
    const pageIndex = parseInt(pageInput, 10) - 1;
    if (!isNaN(pageIndex) && pageIndex >= 0 && pageIndex < totalPages) {
       onJumpToPage(pageIndex);
    } else {
       setPageInput(String(currentPage + 1));
    }
  };

  return (
    <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-[10006] w-full max-w-[90%] sm:max-w-max">
       <div className={`
          flex items-center justify-between sm:justify-start gap-2 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-2xl border
          ${isDark ? "bg-zinc-900 border-white/10 text-zinc-300" : "bg-white border-gray-200 text-gray-700"}
       `}>
          {/* Page nav */}
          <div className="flex items-center gap-1 sm:gap-2">
             <button 
                onClick={onPreviousPage} 
                className={`p-2 rounded-lg transition ${
                  isDark ? "hover:bg-white/5 text-zinc-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                }`}
             >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
             </button>
             
             <div className="flex items-center gap-1.5 sm:gap-2">
                <input
                   type="text"
                   inputMode="numeric"
                   value={pageInput}
                   onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ""))}
                   onBlur={commitPage}
                   onKeyDown={(e) => e.key === "Enter" && commitPage()}
                   className={`w-9 sm:w-12 text-center py-0.5 sm:py-1 font-bold text-sm sm:text-base rounded-lg border outline-none transition-all ${
                      isDark 
                        ? "bg-zinc-800/80 border-white/5 text-blue-400 focus:border-blue-500/50" 
                        : "bg-gray-50 border-gray-200 text-blue-600 focus:border-blue-500/50"
                   }`}
                />
                <span className={`text-[10px] opacity-40 font-bold ${isDark ? "text-white" : "text-black"}`}>/</span>
                <span className={`text-xs sm:text-sm font-black uppercase tracking-tighter ${
                   isDark ? "text-zinc-500" : "text-gray-400"
                }`}>{totalPages || "?"}</span>
             </div>

             <button 
                onClick={onNextPage} 
                className={`p-2 rounded-lg transition ${
                  isDark ? "hover:bg-white/5 text-zinc-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                }`}
             >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
             </button>
          </div>

          <div className={`w-px h-5 sm:h-6 ${isDark ? "bg-white/10" : "bg-gray-200"}`} />

          {/* Zoom ctnrls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
             <button 
               onClick={onZoomOut}
               className={`p-2 rounded-lg transition ${
                  isDark ? "hover:bg-white/5 text-zinc-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
               }`}
             >
               <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
             </button>
             <button 
               onClick={onZoomFit}
               className={`text-[10px] sm:text-sm font-black uppercase tracking-widest transition hover:text-blue-500 ${
                  isDark ? "text-zinc-500" : "text-gray-400"
               }`}
             >
               {Math.round((scale || 1) * 100)}%
             </button>
             <button 
               onClick={onZoomIn}
               className={`p-2 rounded-lg transition ${
                  isDark ? "hover:bg-white/5 text-zinc-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
               }`}
             >
               <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
             </button>
          </div>

          <div className={`w-px h-5 sm:h-6 hidden sm:block ${isDark ? "bg-white/10" : "bg-gray-200"}`} />

          <button 
             onClick={onHelp} 
             className={`p-2 rounded-lg transition hidden sm:flex ${
               isDark ? "hover:bg-white/5 text-zinc-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
             }`}
          >
             <HelpCircle className="w-5 h-5" />
          </button>
       </div>
    </div>
  );
}
