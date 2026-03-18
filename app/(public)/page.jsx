"use client";

import HeroSection from "@/components/HomePage/HeroSection";
import RecentDocs from "@/components/HomePage/RecentDocs";
import { useThemeContext } from "@/components/ThemeProvider";

export default function HomePage() {
  const { theme } = useThemeContext();

  return (
    <div className="min-h-screen">
      <HeroSection theme={theme} />
      <RecentDocs theme={theme} />
    </div>
  );
}
