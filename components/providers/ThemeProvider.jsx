"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useThemeStore } from "@/hooks/useTheme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const themeState = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle("dark", themeState.theme === "dark");
    }
  }, [themeState.theme, mounted]);

  return (
    <ThemeContext.Provider value={{ ...themeState, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used inside ThemeProvider");
  return ctx;
}
