"use client";

import { useState, useEffect } from "react";
import HeroSection from "@/components/HomePage/HeroSection";
import CTASection from "@/components/HomePage/CTASection";
import { useThemeContext } from "@/components/ThemeProvider";

export default function HomePage() {
  const { theme , mounted } = useThemeContext();

  return (
    <div className={`min-h-[90svh] lg:min-h-screen transition-all duration-300`}>
      
      <HeroSection theme={theme} />
      <GlobalStyles />
    </div>
  );
}

function GlobalStyles() {
  return (
    <style jsx global>{`
      @keyframes gradient {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      .animate-gradient {
        background-size: 200% 200%;
        animation: gradient 3s ease infinite;
      }
      .perspective-1000 {
        perspective: 1000px;
      }
      .preserve-3d {
        transform-style: preserve-3d;
      }
    `}</style>
  );
}