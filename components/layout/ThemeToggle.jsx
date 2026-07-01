"use client";

import { Sun, Moon } from "lucide-react";
import { useThemeContext } from "@/components/providers/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme, mounted } = useThemeContext();

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2.5 rounded-xl border transition-all
        bg-[var(--bg-secondary)] border-[var(--border)]
        text-[var(--fg-secondary)] hover:text-[var(--primary)]
        hover:border-[var(--border-hover)] active:scale-95 ${className}`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      suppressHydrationWarning
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted && (
          <motion.span
            key={theme}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            className="block"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.span>
        )}
      </AnimatePresence>
      {!mounted && <div className="w-5 h-5" />}
    </button>
  );
}
