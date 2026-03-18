"use client";

import ThemeToggle from "./ThemeToggle";
import Link from "next/link";
import { Lock, LayoutDashboard, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdminNavbar() {
  const pathname = usePathname();

  // Simple breadcrumb logic
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 h-16">
      <div className="max-w-[1600px] mx-auto h-full px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:block">
              Admin Portal
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2 text-sm text-neutral-500 font-medium">
            <ChevronRight className="w-4 h-4" />
            {segments.map((seg, i) => (
              <div
                key={seg}
                className="flex items-center gap-2 uppercase tracking-widest text-[10px] font-black"
              >
                <span
                  className={i === segments.length - 1 ? "text-blue-500" : ""}
                >
                  {seg}
                </span>
                {i < segments.length - 1 && (
                  <ChevronRight className="w-3 h-3" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
