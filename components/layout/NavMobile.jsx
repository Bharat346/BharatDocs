"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function NavMobile({ links, pathname, onClose, onSearch }) {
  return (
    <>
      <div 
        className="fixed inset-0 bg-[var(--bg)]/80 backdrop-blur-sm z-[98] md:hidden"
        onClick={onClose}
      />
      <div
        className="fixed inset-x-0 top-16 z-[99] p-4 md:hidden animate-fade-in-up"
      style={{ animationDuration: '200ms' }}
    >
      <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 shadow-lg border border-[var(--border)]">
        <div className="flex flex-col gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? "text-[var(--primary)] bg-[var(--primary-ghost)]"
                    : "text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-tertiary)]"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-2">
          <button
            onClick={onSearch}
            className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
              bg-[var(--bg-tertiary)] text-[var(--fg-muted)] hover:text-[var(--fg)]
              transition-all"
          >
            <Search className="w-4 h-4" />
            Search...
          </button>
          <ThemeToggle />
        </div>
      </div>
      </div>
    </>
  );
}
