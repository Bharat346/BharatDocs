"use client";

import { Separator } from "@/components/ui/separator";
import { useThemeContext } from "@/components/ThemeProvider";
import GridBackground from "@/components/GridBG";

export default function NotesLayout({ children }) {
  const { theme } = useThemeContext();

  return (
    <GridBackground>
    <div className={`min-h-screen transition-colors duration-200`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className={`text-3xl font-roboto tracking-tight mb-4 transition-colors duration-200 ${
          theme === "dark" ? "text-zinc-100" : "text-gray-900"
        }`}>
          Notes
        </h1>
<br />

        {children}
      </div>
    </div>
    </GridBackground>
  );
}