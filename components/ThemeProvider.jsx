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
      if (themeState.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [themeState.theme, mounted]);

  const value = {
    ...themeState,
    mounted
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used inside ThemeProvider");
  }
  return ctx;
}
