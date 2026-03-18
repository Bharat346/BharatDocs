"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ChevronRight,
  Notebook,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function HeroSection({ theme }) {
  const isDark = theme === "dark";
  const router = useRouter();
  const [query, setQuery] = useState("");

  const containerRef = useRef(null);
  const elementsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        elementsRef.current,
        { opacity: 0, y: 30, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.15,
          duration: 1,
          ease: "expo.out",
          delay: 0.3,
        },
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const addToRefs = (el) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // Premium CSS Logic
  const bgClass = isDark ? "bg-[#0a0a0a]" : "bg-white";
  const textClass = isDark ? "text-white" : "text-neutral-950";
  const accentText = isDark ? "text-indigo-400" : "text-indigo-600";
  const searchBg = isDark
    ? "bg-neutral-900 border-neutral-800"
    : "bg-white border-neutral-100 shadow-indigo-500/5";
  const searchFocus = isDark
    ? "focus:border-indigo-500/50"
    : "focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5";

  return (
    <section
      ref={containerRef}
      className={`relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden transition-colors duration-700 ${bgClass} ${textClass}`}
    >
      {/* Abstract Background Decoration */}
      <div className="absolute inset-x-0 top-0 h-[70vh] z-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-[-20%] left-[-10%] w-[120%] h-[120%] opacity-10 dark:opacity-20 blur-[120px] rounded-full transition-colors ${isDark ? "bg-indigo-900/40" : "bg-indigo-300/30"}`}
        />
      </div>

      <div className="relative mt-15 z-10 w-full max-w-7xl px-6 flex flex-col items-center">
        {/* Hero Title */}
        <div ref={addToRefs} className="text-center mb-10 max-w-5xl">
          <h1
            className={`text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase ${isDark ? "text-white" : "text-neutral-950"}`}
          >
            Bharat <span className={accentText}>Docs</span>
          </h1>
          <p
            className={`mt-10 max-w-2xl text-lg md:text-xl font-black uppercase tracking-widest leading-none mx-auto italic opacity-70 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}
          >
            Structure your knowledge.
          </p>
        </div>

        {/* Functional Fuzzy Search Bar */}
        <div ref={addToRefs} className="w-full max-w-3xl mb-12 relative group">
          <div
            className={`absolute inset-0 blur-3xl rounded-[3rem] transition-opacity duration-500 opacity-0 group-focus-within:opacity-30 ${isDark ? "bg-indigo-500" : "bg-indigo-300"}`}
          />
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search subjects, topics, or notes..."
              className={`w-full text-xl md:text-2xl font-black p-6 md:p-8 pr-20 md:pr-24 rounded-[2rem] md:rounded-[3rem] border-2 outline-none transition-all shadow-xl shadow-black/5 ${searchBg} ${searchFocus} ${isDark ? "text-white" : "text-neutral-900"} placeholder:text-neutral-400`}
            />
            <button
              type="submit"
              className={`absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[2rem] flex items-center justify-center transition-all ${isDark ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"}`}
            >
              <Search className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </form>
        </div>

        {/* Action Buttons as requested */}
        <div
          ref={addToRefs}
          className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto"
        >
          <Link href="/docs" className="w-full sm:w-auto">
            <Button
              size="lg"
              className={`h-16 px-10 text-xs font-black uppercase tracking-[0.2em] w-full sm:min-w-[240px] rounded-2xl shadow-2xl transition-all duration-300 group ${
                isDark
                  ? "bg-white text-black hover:bg-neutral-200"
                  : "bg-neutral-950 text-white hover:bg-neutral-800"
              }`}
            >
              Explore Docs
              <ChevronRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-all" />
            </Button>
          </Link>

          <Link href="/notes" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className={`h-16 px-10 text-xs font-black uppercase tracking-[0.2em] w-full sm:min-w-[240px] rounded-2xl border-2 transition-all duration-300 shadow-xl ${
                isDark
                  ? "border-neutral-800 bg-transparent text-white hover:bg-neutral-900 shadow-white/5"
                  : "border-neutral-200 bg-transparent text-neutral-950 hover:bg-neutral-50 shadow-black/5"
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