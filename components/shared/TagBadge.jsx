import Link from "next/link";
import { Hash } from "lucide-react";

export default function TagBadge({ tag, active = false, onClick, count = null }) {
  const Component = onClick ? "button" : "span";
  
  return (
    <Component
      onClick={onClick}
      style={active ? { backgroundColor: `${tag.color}20`, color: tag.color, borderColor: `${tag.color}40` } : {}}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all
        ${active 
          ? "" 
          : "bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--fg)]"
        }
      `}
    >
      <Hash className="w-3 h-3 opacity-60" style={active ? { color: tag.color } : {}} />
      {tag.name}
      {count !== null && (
        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[10px] font-mono text-[var(--fg-muted)]">
          {count}
        </span>
      )}
    </Component>
  );
}
