"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeBlock({ children, className, ...props }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Extract raw text from nested children
    const getText = (node) => {
      if (typeof node === 'string') return node;
      if (Array.isArray(node)) return node.map(getText).join('');
      if (node?.props?.children) return getText(node.props.children);
      return '';
    };

    const text = getText(children);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--fg-muted)] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[var(--primary)] hover:border-[var(--primary-ghost)] z-10"
        title="Copy code"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
      <pre 
        className={`${className || ""} overflow-x-auto p-4 rounded-xl border border-[var(--border)] bg-[#0d1117] text-[13px] leading-relaxed no-scrollbar shadow-sm`}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
