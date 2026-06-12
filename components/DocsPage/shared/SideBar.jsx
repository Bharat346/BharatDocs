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
      <div className="flex-1 overflow-y-auto p-4 space-y-1 no-scrollbar">
        {children.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-secondary-bg text-neutral-400"
            >
              <BookOpen size={24} />
            </div>
            <p className="text-sm text-neutral-500">
              No documents found
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2 mb-3 mt-2">Chapters</span>
            {children.map((child) => {
              const isSelected = selectedChild?.nodeId === child.nodeId;

              return (
                <Link
                  key={child.nodeId}
                  href={`/docs/${slug}?child=${child.slug}`}
                  onClick={onChildSelect}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold border border-primary/20 shadow-sm"
                      : "text-neutral-500 hover:bg-secondary-bg hover:text-foreground dark:hover:text-foreground border border-transparent"
                  }`}
                >
                  <FileText size={16} className={`shrink-0 transition-colors ${isSelected ? 'text-primary' : 'text-neutral-400 group-hover:text-primary/70'}`} />
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
