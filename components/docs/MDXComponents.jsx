import { Check, Info, AlertTriangle, AlertCircle, Lightbulb } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CodeBlock from "./CodeBlock";

// Callout component
const Callout = ({ children, type = "default", title }) => {
  const typeConfig = {
    info: {
      style: "bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400 dark:bg-blue-500/10",
      icon: <Info className="w-5 h-5 shrink-0 mt-0.5" />
    },
    warning: {
      style: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500 dark:bg-amber-500/10",
      icon: <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
    },
    danger: {
      style: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-500 dark:bg-red-500/10",
      icon: <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
    },
    error: {
      style: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-500 dark:bg-red-500/10",
      icon: <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
    },
    success: {
      style: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500 dark:bg-emerald-500/10",
      icon: <Check className="w-5 h-5 shrink-0 mt-0.5" />
    },
    tip: {
      style: "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400 dark:bg-fuchsia-500/10",
      icon: <Lightbulb className="w-5 h-5 shrink-0 mt-0.5" />
    },
    default: {
      style: "bg-[var(--bg-tertiary)]/50 backdrop-blur-sm border-[var(--border)] text-[var(--fg)]",
      icon: <Info className="w-5 h-5 shrink-0 mt-0.5 text-[var(--fg-muted)]" />
    }
  };

  const currentConfig = typeConfig[type?.toLowerCase()] || typeConfig.default;

  return (
    <div className={`my-6 p-4 rounded-2xl border flex items-start gap-4 shadow-sm transition-all hover:shadow-md ${currentConfig.style}`}>
      <div className="bg-white/20 dark:bg-black/20 p-2 rounded-xl backdrop-blur-md">
        {currentConfig.icon}
      </div>
      <div className="flex-1 w-full min-w-0 py-1">
        {title && <strong className="font-bold block mb-1.5 text-[15px]">{title}</strong>}
        <div className="text-[15px] opacity-90 prose-p:my-0 prose-p:leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

// Map Markdown elements to styled components
export const MDXComponents = {
  Callout,
  h1: (props) => <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[var(--fg)] mt-12 mb-6 scroll-m-24 group flex items-center" {...props} />,
  h2: (props) => (
    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--fg)] mt-12 mb-4 pb-2 border-b border-[var(--border)] scroll-m-24 group flex items-center" {...props}>
      <a href={`#${props.id}`} className="absolute -ml-8 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--fg-muted)] hover:text-[var(--primary)] p-1">#</a>
      {props.children}
    </h2>
  ),
  h3: (props) => <h3 className="text-xl font-bold tracking-tight text-[var(--fg)] mt-8 mb-4 scroll-m-24" {...props} />,
  h4: (props) => <h4 className="text-lg font-bold text-[var(--fg)] mt-6 mb-3 scroll-m-24" {...props} />,
  p: (props) => <p className="text-[var(--fg-secondary)] text-[16px] leading-relaxed mb-6" {...props} />,
  a: (props) => {
    const isInternal = props.href?.startsWith("/");
    if (isInternal) {
      return <Link {...props} className="font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors underline decoration-1 underline-offset-4" />;
    }
    return <a {...props} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors underline decoration-1 underline-offset-4" />;
  },
  ul: (props) => <ul className="list-disc list-outside ml-6 mb-6 text-[var(--fg-secondary)] space-y-2 marker:text-[var(--fg-muted)]" {...props} />,
  ol: (props) => <ol className="list-decimal list-outside ml-6 mb-6 text-[var(--fg-secondary)] space-y-2 marker:text-[var(--fg-muted)] font-medium" {...props} />,
  li: (props) => <li className="pl-1 text-[16px] leading-relaxed" {...props} />,
  strong: (props) => <strong className="font-semibold text-[var(--fg)]" {...props} />,
  em: (props) => <em className="italic text-[var(--fg)]" {...props} />,
  blockquote: (props) => (
    <blockquote className="border-l-4 border-[var(--primary)] bg-[var(--primary-ghost)]/50 pl-5 py-2 my-6 rounded-r-xl italic text-[var(--fg-secondary)] text-[17px] leading-relaxed shadow-sm" {...props} />
  ),
  hr: (props) => <hr className="my-12 border-[var(--border)]" {...props} />,
  table: (props) => (
    <div className="w-full overflow-x-auto my-8 rounded-2xl border border-[var(--border)] shadow-sm bg-[var(--bg-secondary)]/50 backdrop-blur-md">
      <table className="w-full text-left border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border)]" {...props} />,
  th: (props) => <th className="px-5 py-4 font-bold text-[var(--fg)]" {...props} />,
  td: (props) => <td className="px-5 py-4 border-t border-[var(--border)] text-[var(--fg-secondary)]" {...props} />,
  code: (props) => {
    // If it's inline code (not a block, doesn't have data-language from rehype-pretty-code)
    const isInline = !props.className && !props['data-language'];
    if (isInline) {
      return <code className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border)] text-[13px] font-mono text-[var(--primary)]" {...props} />;
    }
    return <code {...props} />;
  },
  pre: CodeBlock,
  img: (props) => {
    let src = props.src;
    if (src && src.startsWith("http")) {
      src = `/api/image-proxy?url=${encodeURIComponent(src)}`;
    }
    return (
      <span className="block my-10 rounded-[24px] overflow-hidden border border-[var(--border)] bg-[var(--bg-tertiary)] shadow-md transition-shadow hover:shadow-lg flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="max-w-full max-h-[700px] w-auto h-auto object-contain" loading="lazy" {...props} src={src} alt={props.alt || "Documentation image"} />
        {props.alt && (
          <span className="block text-center text-sm font-medium text-[var(--fg-muted)] p-4 border-t border-[var(--border)] bg-[var(--bg-secondary)]/80 backdrop-blur-sm">
            {props.alt}
          </span>
        )}
      </span>
    );
  },
};
