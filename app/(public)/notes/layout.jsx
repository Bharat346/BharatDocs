"use client";

import { useThemeContext } from "@/components/ThemeProvider";
import GridBackground from "@/components/GridBG";

export default function NotesLayout({ children }) {
  const { theme } = useThemeContext();

  return (
    <GridBackground>
      <div className="min-h-screen">
        <div className="mx-auto max-w-4xl px-4 sm:px-5 lg:px-7 py-8">
          <h1
            className={`text-3xl font-roboto tracking-tight mb-4 ${
              theme === "dark" ? "text-zinc-100" : "text-gray-900"
            }`}
          >
            Notes
          </h1>

          {children}
        </div>
      </div>
    </GridBackground>
  );
}
