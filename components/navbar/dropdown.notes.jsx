"use client";
import Link from "next/link";
import { shouldPrefetch } from "@/lib/network/network.config";

export default function DropdownNotes({ structure, theme }) {
  return (
    <div
      suppressHydrationWarning
      className={`relative w-[600px] rounded-xl border shadow-2xl ${
        theme === "dark"
          ? "bg-black/100 border-gray-800 shadow-blue-900/10"
          : "bg-white border-gray-200 shadow-gray-200/50"
      }`}
    >
      <div className="p-6 space-y-8">
        {structure.map((category) => (
          <div key={category.title}>
            <div className="flex items-center gap-2 mb-4">
              {category.icon && (
                <category.icon
                  className={`h-4 w-4 ${
                    theme === "dark" ? "text-blue-400" : "text-blue-600"
                  }`}
                />
              )}
              <h3
                suppressHydrationWarning
                className={`text-sm font-bold uppercase tracking-wider ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {category.title}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {category.subjects.map((subject) => (
                <Link
                  key={subject.name}
                  href={subject.href}
                  prefetch={shouldPrefetch()}
                  suppressHydrationWarning
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    theme === "dark"
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {subject.icon && <subject.icon className="h-3.5 w-3.5" />}
                  <span className="font-mono">{subject.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
