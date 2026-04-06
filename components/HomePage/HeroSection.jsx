"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight, Notebook, Search } from "lucide-react";
import SearchOverlay from "@/components/ui/search-overlay";

export default function HeroSection({ theme }) {
  const isDark = theme === "dark";
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const containerRef = useRef(null);
  const elementsRef = useRef([]);

  const addToRefs = (el) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  // Premium CSS Logic
  const bgClass = isDark ? "bg-[#18181b]" : "bg-white";
  const textClass = isDark ? "text-white" : "text-neutral-950";
  const accentText = isDark ? "text-indigo-400" : "text-indigo-600";
  const searchBg = isDark
    ? "bg-neutral-900/50 border-neutral-800"
    : "bg-white border-neutral-100 shadow-indigo-500/5";
  const searchFocus = isDark
    ? "focus:border-indigo-500/50"
    : "focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5";

  return (
    <section
      ref={containerRef}
      className={`relative min-h-[85vh] sm:min-h-screen flex items-center justify-center pt-20 sm:pt-24 pb-10 sm:pb-12 overflow-hidden transition-colors duration-700 ${bgClass} ${textClass}`}
    >
      {/* Abstract Background Decoration removed as per request */}


      <div className="relative sm:mt-15 z-10 w-full max-w-7xl px-6 flex flex-col items-center">
        {/* Hero Title */}
        <div ref={addToRefs} className="text-center mb-10 max-w-5xl">
          <h1
            className={`text-[2.5rem] sm:text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase ${isDark ? "text-white" : "text-neutral-950"} relative`}
          >
            Bharat <span className={accentText}>Docs</span>
          </h1>
          <p
            className={`mt-6 sm:mt-8 md:mt-10 max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl font-bold uppercase tracking-widest leading-relaxed mx-auto italic opacity-70 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}
          >
            Structure your Knowledge. Master the Workflow.
          </p>
        </div>

        {/* Functional Fuzzy Search Bar */}
        <div ref={addToRefs} className="w-full max-w-3xl mb-12 relative group">
          <div className="relative cursor-text" onClick={() => setIsSearchOpen(true)}>
            <div
              className={`w-full text-base sm:text-lg md:text-xl lg:text-2xl font-semibold p-4 sm:p-5 md:p-6 lg:p-8 pr-16 sm:pr-18 md:pr-20 lg:pr-24 rounded-xl sm:rounded-[2rem] md:rounded-[3rem] border-2 outline-none transition-all shadow-xl shadow-black/5 ${searchBg} ${isDark ? "text-zinc-500" : "text-neutral-400"} flex items-center`}
            >
              Search subjects, topics, or notes...
            </div>
            <button
              type="button"
              className={`absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[2rem] flex items-center justify-center transition-all ${isDark ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"}`}
            >
              <Search className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </div>
        </div>

        <SearchOverlay isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} theme={theme} />

        {/* Action Buttons */}
        <div
          ref={addToRefs}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto"
        >
          <Link href="/docs" className="w-full sm:w-auto">
            <Button
              size="lg"
              className={`hero-btn-primary h-14 sm:h-16 px-8 sm:px-10 text-[0.8rem] sm:text-[0.9rem] font-bold uppercase tracking-[0.08em] w-full sm:min-w-[240px] rounded-2xl transition-all duration-300 group ${
                isDark
                  ? "bg-white text-black hover:bg-black hover:text-white border-2 border-white"
                  : "bg-neutral-950 text-white hover:bg-white hover:text-black border-2 border-black"
              }`}
            >
              Explore Docs
              <ChevronRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
          </Link>

          <Link href="/notes" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className={`hero-btn-outline h-14 sm:h-16 px-8 sm:px-10 text-[0.8rem] sm:text-[0.9rem] font-bold uppercase tracking-[0.08em] w-full sm:min-w-[240px] rounded-2xl border-2 transition-all duration-300 ${
                isDark
                  ? "border-neutral-700 bg-transparent text-white hover:bg-white hover:text-black border-2 border-black"
                  : "border-neutral-200 bg-transparent text-neutral-950 hover:bg-black hover:text-white border-2 border-black"
              }`}
            >
              <Notebook className="mr-3 w-5 h-5" />
              Browse Notes
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
