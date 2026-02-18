"use client";
import Link from "next/link";
import { shouldPrefetch } from "@/lib/network/network.config";

export default function DropdownDocuments({ items, theme }) {
  return (
    <div
      suppressHydrationWarning
      className={`relative w-64 rounded-xl border shadow-xl ${
        theme === "dark"
          ? "bg-black/100 border-gray-800 shadow-blue-900/10"
          : "bg-white border-gray-200 shadow-gray-200/50"
      }`}
    >
      <div className="p-2">
        {items.map((child) => (
          <Link
            key={child.label}
            href={child.href}
            prefetch={shouldPrefetch()}
            suppressHydrationWarning
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              theme === "dark"
                ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {child.icon && <child.icon className="h-4 w-4" />}
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
