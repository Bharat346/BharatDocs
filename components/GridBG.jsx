"use client";

import { useThemeContext } from "./ThemeProvider";

/**
 * Simple solid-color background wrapper.
 * No dots, no floating particles, no gradients – just a clean bg.
 */
export default function GridBackground({ children, className = "" }) {
  const { theme } = useThemeContext();
  const isDark = theme === "dark";

  return (
    <div
      className={`relative w-full min-h-full ${className}`}
      style={{
        backgroundColor: isDark ? "var(--color-bg)" : "var(--color-bg)",
      }}
    >
      {children}
    </div>
  );
}
