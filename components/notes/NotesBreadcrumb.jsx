import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export default function NotesBreadcrumb({ segments = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 overflow-x-auto no-scrollbar">
      <ol className="flex items-center min-w-min whitespace-nowrap bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5">
        <li className="flex items-center">
          <Link
            href="/notes"
            className="text-[var(--fg-muted)] hover:text-[var(--primary)] transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Home className="w-4 h-4" />
            <span>Notes</span>
          </Link>
        </li>
        
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const href = `/notes/${segments.slice(0, index + 1).join("/")}`;

          return (
            <li key={href} className="flex items-center">
              <ChevronRight className="w-4 h-4 text-[var(--border-hover)] mx-2 flex-shrink-0" />
              {isLast ? (
                <span className="text-sm font-bold text-[var(--fg)]" aria-current="page">
                  {decodeURIComponent(segment)}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--primary)] transition-colors"
                >
                  {decodeURIComponent(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
