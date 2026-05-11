"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Notebook,
  Sparkles,
  Search,
  ArrowDown,
} from "lucide-react";
import SearchOverlay from "@/components/ui/search-overlay";
import { motion } from "framer-motion";

export default function HeroSection({ theme }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const phrases = [
    "What should I learn today?",
    "Explore engineering notes…",
    "Read curated documentation…",
    "Discover insightful blogs…",
    "Try BharatDocs!!",
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
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center pt-20 pb-16 overflow-hidden transition-colors duration-700 bg-background text-foreground">
      {/* ── Ambient Background ── */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Top-left orb */}
        <div className="absolute -top-[20%] -left-[15%] w-[50%] h-[50%] rounded-full bg-blue-500/[0.07] dark:bg-blue-500/[0.05] blur-[100px]" />
        {/* Bottom-right orb */}
        <div className="absolute -bottom-[20%] -right-[15%] w-[50%] h-[50%] rounded-full bg-indigo-500/[0.07] dark:bg-indigo-400/[0.04] blur-[100px]" />
        {/* Center subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(var(--fg) 1px, transparent 1px), linear-gradient(90deg, var(--fg) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center">
        {/* ── Badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 px-5 py-1.5 rounded-full border border-primary/20 bg-primary/[0.06] text-primary text-[10px] sm:text-xs font-black uppercase tracking-[0.25em]"
        >
          Resolute Learning
        </motion.div>

        {/* ── Title ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-6 flex gap-5"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-[-0.06em] leading-[0.85] text-foreground">
            Bharat
          </h1>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-[-0.06em] leading-[0.85] text-primary">
            Docs
          </h1>
        </motion.div>

        {/* ── Typewriter ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="h-8 sm:h-10 flex items-center justify-center mb-14"
        >
          <p className="text-sm sm:text-base md:text-lg font-semibold tracking-wide text-foreground/50 italic">
            {displayText}
            <span className="inline-block w-[2px] h-5 sm:h-6 bg-primary ml-1 animate-[blink_1s_infinite] align-middle" />
          </p>
        </motion.div>

        {/* ── Search Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full max-w-2xl mb-16"
        >
          <div
            className="relative cursor-pointer group"
            onClick={() => setIsSearchOpen(true)}
          >
            <div className="w-full text-base sm:text-lg font-medium py-5 px-7 pr-20 rounded-2xl border-2 border-border bg-secondary-bg text-foreground/30 flex items-center transition-all duration-300 group-hover:border-primary/40">
              Search anything…
              <span className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center text-foreground/20 transition-transform duration-200 hover:scale-105 active:scale-95">
                ⌘K
              </span>
            </div>
          </div>
        </motion.div>

        <SearchOverlay
          isOpen={isSearchOpen}
          onOpenChange={setIsSearchOpen}
          theme={theme}
        />

        {/* ── CTA Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link href="/docs" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="h-14 px-8 text-sm font-bold uppercase tracking-[0.12em] w-full sm:min-w-[200px] rounded-xl transition-all duration-300 bg-foreground text-background hover:bg-primary hover:text-white border-2 border-foreground hover:border-primary group"
            >
              Explore Docs
              <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>

          <Link href="/notes" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-sm font-bold uppercase tracking-[0.12em] w-full sm:min-w-[200px] rounded-xl border-2 border-border bg-transparent text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
            >
              <Notebook className="mr-2 w-4 h-4" />
              Browse Notes
            </Button>
          </Link>

          <Link href="/blogs" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-sm font-bold uppercase tracking-[0.12em] w-full sm:min-w-[200px] rounded-xl border-2 border-border bg-transparent text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
            >
              <Sparkles className="mr-2 w-4 h-4" />
              Read Blog
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
