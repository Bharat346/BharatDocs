import Link from "next/link";
import Image from "next/image";
import {
  Info,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";

import { Pre, QnABlock } from "./MDXInteractive";

/* ==========================================
   Callout — Info / Warning / Danger alerts
   ========================================== */
const Callout = ({ type = "info", title, children }) => {
  const config = {
    info: {
      icon: <Info className="w-5 h-5 text-blue-500" />,
      cls: "prose-alert prose-alert-info border",
      titleCls: "text-blue-500",
      accentCls: "bg-blue-500/10",
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      cls: "prose-alert prose-alert-warning border",
      titleCls: "text-amber-500",
      accentCls: "bg-amber-500/10",
    },
    danger: {
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      cls: "prose-alert prose-alert-danger border",
      titleCls: "text-red-500",
      accentCls: "bg-red-500/10",
    },
  };

  const c = config[type] || config.info;

  return (
    <div className={`my-6 flex gap-4 p-5 rounded-2xl ${c.cls}`}>
      <div className={`mt-0.5 p-2 rounded-xl shrink-0 h-fit ${c.accentCls}`}>
        {c.icon}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h5 className={`font-bold text-sm mb-1.5 ${c.titleCls}`}>{title}</h5>
        )}
        <div className="text-[0.95rem] leading-relaxed opacity-90">
          {children}
        </div>
      </div>
    </div>
  );
};



/* ==========================================
   MDXComponents — mapping for compileMDX
   ========================================== */
export const MDXComponents = {
  pre: Pre,
  Callout,
  QnABlock,
  h1: (props) => <h1 className="heading-h1" {...props} />,
  h2: (props) => <h2 className="heading-h2" {...props} />,
  h3: (props) => <h3 className="heading-h3" {...props} />,
  h4: (props) => <h4 className="heading-h4" {...props} />,
  p: (props) => <p className="prose-paragraph" {...props} />,
  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith("http");
    if (isExternal) {
      return (
        <a
          href={href}
          className="prose-link"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href || "#"} className="prose-link" {...props}>
        {children}
      </Link>
    );
  },
  ul: (props) => <ul className="prose-list" {...props} />,
  ol: (props) => <ol className="prose-list" {...props} />,
  li: (props) => <li className="prose-list-item" {...props} />,
  blockquote: (props) => <blockquote className="prose-blockquote" {...props} />,
  hr: () => (
    <hr className="prose-hr my-12 border-none h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent opacity-50" />
  ),
  strong: (props) => <strong className="prose-strong" {...props} />,
  em: (props) => (
    <em className="italic text-zinc-700 dark:text-zinc-300" {...props} />
  ),

  // Only style as inline-code-tag if it doesn't have a rehype-pretty-code block language class
  code: ({ className, ...props }) => {
    const isInline = !className || !className.includes("language-");
    return (
      <code className={isInline ? "inline-code-tag" : className} {...props} />
    );
  },

  // Image Proxy Implementation
  img: ({ src, alt, ...rest }) => {
    const isExternal = src?.startsWith("http");
    // Send external or relative images through the proxy to bypass CORS and fix paths
    const finalSrc = src?.includes("/api/image-proxy")
      ? src
      : `/api/image-proxy?url=${encodeURIComponent(src || "")}`;

    return (
      <span className="block my-10 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800/80 shadow-md bg-zinc-50 dark:bg-zinc-900/50 transition-all hover:shadow-lg">
        <Image
          src={finalSrc}
          alt={alt || "Image"}
          width={0}
          height={0}
          sizes="100vw"
          unoptimized={isExternal}
          className="w-full h-auto object-contain max-h-[600px] bg-black/5 dark:bg-white/5"
          style={{ width: "100%", height: "auto" }}
          {...rest}
        />
        {alt && (
          <span className="block w-full p-3 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-white dark:bg-[#0a0a0a] border-t border-zinc-200 dark:border-zinc-800">
            {alt}
          </span>
        )}
      </span>
    );
  },

  table: (props) => (
    <div className="overflow-x-auto my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <table className="w-full text-sm text-left" {...props} />
    </div>
  ),
  th: (props) => (
    <th
      className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 font-semibold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800"
      {...props}
    />
  ),
  td: (props) => (
    <td
      className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/50 text-zinc-600 dark:text-zinc-300"
      {...props}
    />
  ),
};
