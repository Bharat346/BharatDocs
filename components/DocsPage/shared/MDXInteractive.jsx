"use client";

import React, { useState } from "react";
import { Check, Copy, ChevronDown } from "lucide-react";

/* ==========================================
   Pre — Code block with copy button + macOS dots
   ========================================== */
export const Pre = ({ children, ...props }) => {
  const [copied, setCopied] = useState(false);

  const extractText = (node) => {
    if (typeof node === "string") return node;
    if (typeof node === "number") return node.toString();
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (node && node.props && node.props.children) {
      return extractText(node.props.children);
    }
    return "";
  };

  const handleCopy = async () => {
    const text = extractText(children);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-8 rounded-2xl overflow-hidden prose-code-block transition-all shadow-sm border border-zinc-200 dark:border-zinc-800/80">
      <div className="flex items-center justify-between px-4 py-2.5 prose-code-header bg-zinc-100/50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400/80 border border-red-500/20" />
          <div className="w-3 h-3 rounded-full bg-amber-400/80 border border-amber-500/20" />
          <div className="w-3 h-3 rounded-full bg-green-400/80 border border-green-500/20" />
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-all flex items-center gap-2 text-xs font-semibold"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre
        {...props}
        className="p-5 overflow-x-auto text-[0.92rem] leading-loose prose-code-content bg-zinc-50 dark:bg-[#0d1117]"
      >
        {children}
      </pre>
    </div>
  );
};

/* ==========================================
   QnABlock — Expandable question / answer
   ========================================== */
export const QnABlock = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-6 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl overflow-hidden bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700/50 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-5 py-4 flex items-center justify-between font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
      >
        <span className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 text-xs font-bold shrink-0">
            Q
          </span>
          <span className="text-[0.95rem] leading-snug">{question}</span>
        </span>
        <span
          className={`transform transition-transform duration-300 p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 shrink-0 ml-3 ${isOpen ? "rotate-180" : ""}`}
        >
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 py-5 border-t border-zinc-200 dark:border-zinc-800/50 text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed bg-zinc-50/50 dark:bg-zinc-950/20 flex gap-3">
          <span className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 text-xs font-bold shrink-0 mt-0.5">
            A
          </span>
          <div className="flex-1">{answer}</div>
        </div>
      </div>
    </div>
  );
};
