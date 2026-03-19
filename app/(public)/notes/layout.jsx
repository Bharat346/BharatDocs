"use client";

import { useThemeContext } from "@/components/ThemeProvider";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotesLayout({ children }) {
  const { theme } = useThemeContext();

  return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-4xl px-4 sm:px-5 lg:px-7 py-8 mt-15">
          <div className="flex flex-col gap-4 sm:gap-6">
          <Link
            href="/"
            className="group flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-indigo-500 transition-colors self-start"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />{" "}
            Back Home
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
            <span className="text-indigo-600 dark:text-indigo-400">
              Notes
            </span>
          </h1>
        </div>

        <br />

          {children}
        </div>
      </div>
  );
}
