"use client";

import HeroSection from "@/components/HomePage/HeroSection";
import { useThemeContext } from "@/components/ThemeProvider";

export default function HomePage() {
  const { theme } = useThemeContext();

  return (
    <div className="min-h-screen">
      <HeroSection theme={theme} />
    </div>
  );
}
