"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight, Notebook, Search } from "lucide-react";
import SearchOverlay from "@/components/ui/search-overlay";

export default function HeroSection({ theme }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const containerRef = useRef(null);
  const elementsRef = useRef([]);

  const addToRefs = (el) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  const phrases = [
    "Hi there! 👋",
    "Are you looking for a learning platform?",
    "Are you searching for answers to your engineering questions?",
    "What should I learn today?",
    "Where to start study?",
    "Try BharatDocs!!"
  ];
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const handleTyping = () => {
      const fullText = phrases[currentPhraseIndex];
      if (!isDeleting) {
        setDisplayText(fullText.substring(0, displayText.length + 1));
        setTypingSpeed(70);
        if (displayText === fullText) {
          setTimeout(() => setIsDeleting(true), 2500);
        }
      } else {
        setDisplayText(fullText.substring(0, displayText.length - 1));
        setTypingSpeed(30);
        if (displayText === "") {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentPhraseIndex]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-12 overflow-hidden transition-colors duration-700 bg-background text-foreground"
    >
      {/* 🎭 Artistic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full max-w-7xl px-6 flex flex-col items-center">
        {/* ✨ Badge */}
        <div 
          ref={addToRefs}
          className="mb-8 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] animate-fade-in"
        >
          Resolute Learning
        </div>

        {/* Hero Title */}
        <div ref={addToRefs} className="text-center mb-12 max-w-5xl">
          <h1
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] uppercase text-foreground"
          >
            Bharat <span className="text-primary">Docs</span>
          </h1>
          <div className="h-10 sm:h-12 flex items-center justify-center mt-4">
            <p
              className="text-sm sm:text-base md:text-lg font-bold uppercase tracking-[0.2em] leading-relaxed mx-auto italic text-primary drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            >
              {displayText}
              <span className="inline-block w-1 h-5 sm:w-1.5 sm:h-6 bg-primary ml-1.5 animate-[blink_1s_infinite] shadow-[0_0_10px_rgba(37,99,235,0.8)] align-middle"></span>
            </p>
          </div>
        </div>

        {/* 🔍 Functional Fuzzy Search Bar */}
        <div ref={addToRefs} className="w-full max-w-3xl mb-14 relative group">
          <div 
            className="relative cursor-text group" 
            onClick={() => setIsSearchOpen(true)}
          >
            <div
              className="w-full text-base sm:text-lg md:text-xl font-semibold p-6 sm:p-8 pr-20 sm:pr-24 rounded-3xl sm:rounded-[2.5rem] border-2 border-border transition-all shadow-2xl shadow-indigo-500/5 bg-secondary-bg text-foreground/40 flex items-center group-hover:border-primary/50 group-hover:shadow-primary/10"
            >
              Search ...
            </div>
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[1.8rem] flex items-center justify-center transition-all bg-primary hover:scale-105 active:scale-95 text-white shadow-lg shadow-primary/20"
            >
              <Search className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </div>
        </div>

        <SearchOverlay isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} theme={theme} />

        {/* ⚡ Action Buttons */}
        <div
          ref={addToRefs}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto"
        >
          <Link href="/docs" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="h-16 px-10 text-[0.9rem] font-bold uppercase tracking-[0.1em] w-full sm:min-w-[240px] rounded-2xl transition-all duration-300 bg-foreground text-background hover:bg-primary hover:text-white border-2 border-foreground hover:border-primary group"
            >
              Explore Docs
              <ChevronRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
          </Link>

          <Link href="/notes" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="h-16 px-10 text-[0.9rem] font-bold uppercase tracking-[0.1em] w-full sm:min-w-[240px] rounded-2xl border-2 border-border bg-transparent text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
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
