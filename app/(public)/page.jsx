"use client";

import HeroSection from "@/components/HomePage/HeroSection";
import RecentDocs from "@/components/HomePage/RecentDocs";
import RecentBlogs from "@/components/HomePage/RecentBlogs";
import { useThemeContext } from "@/components/ThemeProvider";

export default function HomePage() {
  const { theme } = useThemeContext();

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <HeroSection theme={theme} />
      <RecentDocs theme={theme} />
      <RecentBlogs />
    </div>
  );
}
