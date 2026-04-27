import Link from "next/link";
import { BookOpen, FileText, Home } from "lucide-react";

export default function Sidebar({
  children,
  selectedChild,
  onChildSelect,
  slug,
  isMobile = false,
}) {
  return (
    <aside
      className={`h-full flex flex-col transition-all duration-300 bg-background text-foreground ${isMobile ? "w-full" : "w-72"}`}
    >
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {children.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-100 text-gray-400 dark:bg-zinc-800/50 dark:text-zinc-600"
            >
              <BookOpen size={24} />
            </div>
            <p
              className="text-sm text-gray-500 dark:text-zinc-500"
            >
              No documents found
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500 ml-3 mb-3 mt-4">Chapters</span>
            {children.map((child) => {
              const isSelected = selectedChild?.nodeId === child.nodeId;

              return (
                <Link
                  key={child.nodeId}
                  href={`/docs/${slug}?child=${child.slug}`}
                  onClick={onChildSelect}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                    isSelected
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-medium border border-blue-100 dark:border-blue-500/20 shadow-sm"
                      : "text-gray-700 hover:bg-neutral-100/70 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-white border border-transparent"
                  }`}
                >
                  <FileText size={16} className={`shrink-0 ${isSelected ? 'text-blue-500' : 'text-neutral-400 dark:text-zinc-500'}`} />
                  <div className="flex-1 text-sm truncate">
                    {child.name}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </aside>
  );
}
