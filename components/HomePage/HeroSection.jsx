"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Notebook,
  Sparkles,
} from "lucide-react";
import SearchOverlay from "@/components/ui/search-overlay";
import { motion } from "framer-motion";

export default function HeroSection({ theme }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden bg-background transition-colors duration-700">
      {/* ── Ambient Background & Glassmorphism Orbs ── */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden flex items-center justify-center">
        {/* Primary Accent Orb */}
        <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full bg-primary/20 blur-[120px] mix-blend-screen opacity-60 animate-pulse" style={{ animationDuration: '8s' }} />
        {/* Emerald Accent Orb */}
        <div className="absolute bottom-[10%] right-[20%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] rounded-full bg-accent/20 blur-[100px] mix-blend-screen opacity-50 animate-pulse" style={{ animationDuration: '10s' }} />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--fg) 1px, transparent 1px), linear-gradient(90deg, var(--fg) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center">
        {/* ── Badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8 px-4 py-1.5 rounded-full border border-primary/20 bg-secondary-bg/50 backdrop-blur-md shadow-sm text-primary text-xs font-semibold uppercase tracking-widest"
        >
          Resolute Learning
        </motion.div>

        {/* ── Title ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-center mb-6 flex gap-4"
        >
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] font-extrabold tracking-tight leading-none text-foreground drop-shadow-sm">
            Bharat
          </h1>
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] font-extrabold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-br from-primary to-accent drop-shadow-sm">
            Docs
          </h1>
        </motion.div>

        {/* ── Description ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="max-w-2xl text-center mb-12"
        >
          <p className="text-lg sm:text-xl text-text-secondary font-medium leading-relaxed">
            The ultimate human-centric platform for engineered notes, curated documentation, and insightful blogs. Discover everything in one seamless space.
          </p>
        </motion.div>

        {/* ── Search Bar ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
          className="w-full max-w-2xl mb-16"
        >
          <div
            className="relative cursor-pointer group rounded-2xl p-[1px] bg-gradient-to-b from-border/50 to-transparent hover:from-primary/40 transition-all duration-500"
            onClick={() => setIsSearchOpen(true)}
          >
            <div className="w-full text-base sm:text-lg font-medium py-4 px-6 pr-20 rounded-2xl bg-secondary-bg/80 backdrop-blur-xl text-text-secondary flex items-center transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
              <span className="flex-1 opacity-70 group-hover:opacity-100 transition-opacity">Search anything...</span>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg border border-border/50 bg-background/50 text-xs font-mono text-foreground/40 shadow-sm transition-transform duration-200 group-hover:scale-105">
                {mounted && navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl K'}
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
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <Link href="/docs" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="h-14 px-8 text-sm font-bold tracking-wide w-full sm:min-w-[180px] rounded-xl transition-all duration-300 bg-foreground text-background hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20 border-2 border-foreground hover:border-primary group"
            >
              Explore Docs
              <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>

          <Link href="/notes" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-sm font-bold tracking-wide w-full sm:min-w-[180px] rounded-xl border-2 border-border/60 bg-secondary-bg/50 backdrop-blur-md text-foreground hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300"
            >
              <Notebook className="mr-2 w-4 h-4" />
              Browse Notes
            </Button>
          </Link>

          <Link href="/blogs" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-sm font-bold tracking-wide w-full sm:min-w-[180px] rounded-xl border-2 border-border/60 bg-secondary-bg/50 backdrop-blur-md text-foreground hover:border-primary hover:text-primary transition-all duration-300"
            >
              <Sparkles className="mr-2 w-4 h-4 text-accent" />
              Read Blog
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
