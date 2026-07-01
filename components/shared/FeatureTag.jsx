import { Sparkles, Zap, Flame, Clock, Tag as TagIcon } from "lucide-react";

export default function FeatureTag({ type = "default", label, className = "" }) {
  const styles = {
    featured: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    new: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    updated: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    popular: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    default: "bg-[var(--bg-tertiary)] text-[var(--fg-secondary)] border-[var(--border)]"
  };

  const icons = {
    featured: <Sparkles className="w-3 h-3 text-orange-500" />,
    new: <Zap className="w-3 h-3 text-emerald-500" />,
    updated: <Clock className="w-3 h-3 text-blue-500" />,
    popular: <Flame className="w-3 h-3 text-rose-500" />,
    default: <TagIcon className="w-3 h-3" />
  };

  const activeStyle = styles[type?.toLowerCase()] || styles.default;
  const ActiveIcon = icons[type?.toLowerCase()] || icons.default;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${activeStyle} ${className}`}>
      {type?.toLowerCase() === 'featured' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
        </span>
      )}
      {type?.toLowerCase() !== 'featured' && ActiveIcon}
      {label || type}
    </span>
  );
}
