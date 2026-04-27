"use client";

import HeroSection from "@/components/HomePage/HeroSection";
import RecentDocs from "@/components/HomePage/RecentDocs";
import { useThemeContext } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function HomePage() {
  const { theme, toggleTheme, mounted } = useThemeContext();

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <HeroSection theme={theme} />
      <RecentDocs theme={theme} />
    </div>
  );
}
