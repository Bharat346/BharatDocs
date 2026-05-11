"use client";
import Link from "next/link";
import { shouldPrefetch } from "@/lib/network/network.config";
import { FileText, ChevronRight, BookOpen } from "lucide-react";

export default function DropdownDocuments({ items, theme }) {
  // Separate "All Documents" from the rest
  const allDocsItem = items.find(item => item.label === "All Documents");
  const specificDocs = items.filter(item => item.label !== "All Documents");

  return (
    <div
      suppressHydrationWarning
      className={`relative w-80 rounded-2xl border shadow-2xl p-2 ${
        theme === "dark"
          ? "bg-[#0c0c0e] border-white/10 shadow-black/50"
          : "bg-white border-gray-100 shadow-gray-200/40"
      }`}
    >
      <div className="flex flex-col gap-1">
        {allDocsItem && (
          <Link
            href={allDocsItem.href}
            prefetch={shouldPrefetch()}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all group ${
              theme === "dark"
                ? "bg-white/5 text-blue-400 hover:bg-white/10"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
          >
            <BookOpen className="h-4.5 w-4.5" />
            <div className="flex-1">
              <div className="text-xs font-black uppercase tracking-widest">
                {allDocsItem.label}
              </div>
              <div className="text-[10px] opacity-70">Browse the entire library</div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        )}

        <div className="px-3 py-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-zinc-600">
            Recent Archives
          </span>
        </div>

        <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-0.5">
          {specificDocs.map((child) => (
            <Link
              key={child.label}
              href={child.href}
              prefetch={shouldPrefetch()}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${
                theme === "dark"
                  ? "text-gray-400 hover:bg-white/5 hover:text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <FileText className="h-4 w-4 shrink-0 opacity-40 group-hover:opacity-100 group-hover:text-blue-500 transition-all" />
              <span className="text-sm font-medium truncate">{child.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
