"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Info,
  AlertTriangle,
  ChevronRight,
  Code,
  FileText,
  Quote,
  List,
  Type,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import "highlight.js/styles/github-dark.css";
import "highlight.js/styles/github.css";
import "./mdx-style.css";

export default function MDXContent({
  content,
  theme = "dark",
  headingRefs = {},
}) {
  const [copied, setCopied] = useState(null);

  if (!content) {
    return (
      <div
        className={`flex items-center justify-center min-h-[400px] rounded-xl ${
          theme === "dark"
            ? "bg-zinc-900/50 border border-zinc-800"
            : "bg-gray-50 border border-gray-200"
        }`}
      >
        <div className="text-center">
          <FileText
            className={`w-12 h-12 mx-auto mb-4 ${
              theme === "dark" ? "text-zinc-600" : "text-gray-400"
            }`}
          />
          <p
            className={`text-lg ${
              theme === "dark" ? "text-zinc-400" : "text-gray-600"
            }`}
          >
            Loading content...
          </p>
        </div>
      </div>
    );
  }

  const handleCopyCode = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(index);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Custom components for ReactMarkdown
  const components = {
    // Headings with anchor links
    h1: ({ node, ...props }) => {
      const id = props.children.toString().toLowerCase();
      return (
        <div className="relative group">
          <h1
            id={id}
            ref={(el) => {
              if (el && headingRefs.current) {
                headingRefs.current[id] = el;
              }
            }}
            className={`text-4xl font-bold mb-8 mt-12 pb-4 border-b ${
              theme === "dark"
                ? "border-zinc-800 text-white"
                : "border-gray-200 text-gray-900"
            }`}
            {...props}
          />
          <a
            href={`#${id}`}
            className={`absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity ${
              theme === "dark" ? "text-zinc-500" : "text-gray-400"
            }`}
          >
            <Hash size={20} />
          </a>
        </div>
      );
    },

    h2: ({ node, ...props }) => {
      console.log(
        "props - children >>>>> ",
        props.children.toString().toLowerCase(),
      );
      const id = props.children.toString().toLowerCase();
      return (
        <div className="relative group">
          <h2
            id={id}
            ref={(el) => {
              if (el && headingRefs.current) {
                headingRefs.current[id] = el;
              }
            }}
            className={`text-2xl font-bold mb-6 mt-10 pb-3 border-b ${
              theme === "dark"
                ? "border-zinc-800 text-white"
                : "border-gray-200 text-gray-900"
            }`}
            {...props}
          />
          <a
            href={`#${id}`}
            className={`absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity ${
              theme === "dark" ? "text-zinc-500" : "text-gray-400"
            }`}
          >
            <Hash size={18} />
          </a>
        </div>
      );
    },

    h3: ({ node, ...props }) => {
      const id = props.children.toString().toLowerCase();
      return (
        <div className="relative group">
          <h3
            id={id}
            ref={(el) => {
              if (el && headingRefs.current) {
                headingRefs.current[id] = el;
              }
            }}
            className={`text-xl font-semibold mb-4 mt-8 ${
              theme === "dark" ? "text-zinc-100" : "text-gray-800"
            }`}
            {...props}
          />
          <a
            href={`#${id}`}
            className={`absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity ${
              theme === "dark" ? "text-zinc-500" : "text-gray-400"
            }`}
          >
            <Hash size={16} />
          </a>
        </div>
      );
    },

    h4: ({ node, ...props }) => {
      const id = props.children.toString().toLowerCase().replace(/\s+/g, "-");
      return (
        <h4
          id={id}
          ref={(el) => {
            if (el && headingRefs.current) {
              headingRefs.current[id] = el;
            }
          }}
          className={`text-lg font-semibold mb-3 mt-6 ${
            theme === "dark" ? "text-zinc-200" : "text-gray-700"
          }`}
          {...props}
        />
      );
    },

    // Paragraphs
    p: ({ node, ...props }) => (
      <p
        className={`mb-6 leading-relaxed ${
          theme === "dark" ? "text-zinc-300" : "text-gray-700"
        }`}
        {...props}
      />
    ),

    // Lists
    ul: ({ node, ...props }) => (
      <ul
        className={`mb-6 pl-5 space-y-2 ${
          theme === "dark" ? "text-zinc-300" : "text-gray-700"
        }`}
        {...props}
      />
    ),
    ol: ({ node, ...props }) => (
      <ol
        className={`mb-6 pl-5 space-y-2 list-decimal ${
          theme === "dark" ? "text-zinc-300" : "text-gray-700"
        }`}
        {...props}
      />
    ),
    li: ({ node, ...props }) => (
      <li
        className={`relative pl-2 ${
          theme === "dark" ? "text-zinc-300" : "text-gray-700"
        }`}
        {...props}
      />
    ),

    // Links
    a: ({ node, ...props }) => (
      <a
        {...props}
        className={`inline-flex items-center gap-1 font-medium border-b transition-all ${
          theme === "dark"
            ? "text-blue-400 hover:text-blue-300 border-blue-400/30 hover:border-blue-300"
            : "text-blue-600 hover:text-blue-700 border-blue-600/30 hover:border-blue-700"
        }`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {props.children}
        <ExternalLink size={14} className="inline" />
      </a>
    ),

    // Code blocks with copy button
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      const isInline = inline;

      if (isInline) {
        return (
          <code
            className={`px-2 py-1 rounded-md font-mono text-sm ${
              theme === "dark"
                ? "bg-zinc-800 text-zinc-200"
                : "bg-gray-100 text-gray-800"
            }`}
            {...props}
          >
            {children}
          </code>
        );
      }

      const codeContent = String(children).replace(/\n$/, "");
      const language = match?.[1] || "text";
      const index = Math.random().toString(36).substr(2, 9);

      return (
        <div
          className={`relative my-8 rounded-xl overflow-hidden border ${
            theme === "dark"
              ? "bg-zinc-900 border-zinc-800"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          {/* Code header */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-b ${
              theme === "dark"
                ? "bg-zinc-800 border-zinc-700"
                : "bg-gray-100 border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Code
                size={16}
                className={theme === "dark" ? "text-zinc-400" : "text-gray-500"}
              />
              <span
                className={`font-mono text-sm font-medium ${
                  theme === "dark" ? "text-zinc-300" : "text-gray-700"
                }`}
              >
                {language}
              </span>
            </div>
            <button
              onClick={() => handleCopyCode(codeContent, index)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                theme === "dark"
                  ? "hover:bg-zinc-700 text-zinc-300"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              {copied === index ? (
                <>
                  <Check size={14} className="text-green-500" />
                  <span
                    className={
                      theme === "dark" ? "text-green-400" : "text-green-600"
                    }
                  >
                    Copied!
                  </span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Code content */}
          <pre
            className={`overflow-x-auto p-4 m-0 ${
              theme === "dark" ? "text-zinc-100" : "text-gray-800"
            }`}
          >
            <code
              className={`hljs language-${language} block whitespace-pre ${className || ""}`}
              {...props}
            >
              {children}
            </code>
          </pre>
        </div>
      );
    },

    // Blockquotes
    blockquote: ({ node, ...props }) => (
      <div
        className={`relative my-8 pl-6 border-l-4 ${
          theme === "dark"
            ? "border-blue-500/50 bg-blue-500/5"
            : "border-blue-500 bg-blue-50"
        }`}
      >
        <Quote
          className={`absolute left-[-12px] top-[-12px] w-6 h-6 ${
            theme === "dark" ? "text-blue-500/30" : "text-blue-500/40"
          }`}
        />
        <blockquote
          className={`py-4 italic ${
            theme === "dark" ? "text-zinc-300" : "text-gray-700"
          }`}
          {...props}
        />
      </div>
    ),

    // Tables
    table: ({ node, ...props }) => (
      <div
        className={`overflow-x-auto my-8 rounded-lg border ${
          theme === "dark"
            ? "border-zinc-800 bg-zinc-900/50"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <table
          className={`w-full border-collapse ${
            theme === "dark" ? "text-zinc-300" : "text-gray-700"
          }`}
          {...props}
        />
      </div>
    ),
    th: ({ node, ...props }) => (
      <th
        className={`px-4 py-3 text-left font-semibold border-b ${
          theme === "dark"
            ? "border-zinc-800 bg-zinc-800/50"
            : "border-gray-200 bg-gray-100"
        }`}
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td
        className={`px-4 py-3 border-b ${
          theme === "dark" ? "border-zinc-800" : "border-gray-200"
        }`}
        {...props}
      />
    ),

    // Horizontal Rule
    hr: ({ node, ...props }) => (
      <hr
        className={`my-12 border-0 h-px ${
          theme === "dark"
            ? "bg-gradient-to-r from-transparent via-zinc-700 to-transparent"
            : "bg-gradient-to-r from-transparent via-gray-300 to-transparent"
        }`}
        {...props}
      />
    ),

    // Images
    img: ({ node, src, alt, ...props }) => {
      const isDark = theme === "dark";

      // Detect external images
      const isExternal =
        typeof src === "string" &&
        (src.startsWith("http://") || src.startsWith("https://"));

      // Proxy ONLY external images
      const finalSrc = isExternal
        ? `/api/image-proxy?url=${encodeURIComponent(src)}`
        : src;

      return (
        <figure className="my-10">
          <img
            src={finalSrc}
            alt={alt ?? ""}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className={`
          mx-auto max-w-full h-auto rounded-xl border
          transition-shadow duration-300
          ${
            isDark
              ? "border-zinc-800 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
              : "border-gray-200 shadow-lg"
          }
        `}
            {...props}
          />

          {alt && (
            <figcaption
              className={`mt-3 text-center text-sm italic ${
                isDark ? "text-zinc-500" : "text-gray-500"
              }`}
            >
              {alt}
            </figcaption>
          )}
        </figure>
      );
    },

    // Custom alert/note boxes
    // Support for special syntax like :::note, :::warning, :::info
    div: ({ node, ...props }) => {
      const className = props.className || "";

      if (className.includes("note") || className.includes("tip")) {
        return (
          <div
            className={`my-6 p-4 rounded-lg border ${
              theme === "dark"
                ? "border-blue-500/30 bg-blue-500/10"
                : "border-blue-500/40 bg-blue-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <Info
                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              />
              <div
                className={`flex-1 ${theme === "dark" ? "text-zinc-300" : "text-gray-700"}`}
              >
                {props.children}
              </div>
            </div>
          </div>
        );
      }

      if (className.includes("warning") || className.includes("caution")) {
        return (
          <div
            className={`my-6 p-4 rounded-lg border ${
              theme === "dark"
                ? "border-amber-500/30 bg-amber-500/10"
                : "border-amber-500/40 bg-amber-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  theme === "dark" ? "text-amber-400" : "text-amber-600"
                }`}
              />
              <div
                className={`flex-1 ${theme === "dark" ? "text-zinc-300" : "text-gray-700"}`}
              >
                {props.children}
              </div>
            </div>
          </div>
        );
      }

      if (className.includes("danger") || className.includes("error")) {
        return (
          <div
            className={`my-6 p-4 rounded-lg border ${
              theme === "dark"
                ? "border-red-500/30 bg-red-500/10"
                : "border-red-500/40 bg-red-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  theme === "dark" ? "text-red-400" : "text-red-600"
                }`}
              />
              <div
                className={`flex-1 ${theme === "dark" ? "text-zinc-300" : "text-gray-700"}`}
              >
                {props.children}
              </div>
            </div>
          </div>
        );
      }

      return <div {...props} />;
    },

    // Strong/bold text
    strong: ({ node, ...props }) => (
      <strong
        className={`font-bold ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
        {...props}
      />
    ),

    // Emphasis/italic text
    em: ({ node, ...props }) => (
      <em
        className={`italic ${
          theme === "dark" ? "text-zinc-300" : "text-gray-700"
        }`}
        {...props}
      />
    ),
  };

  return (
    <div
      className={cn(
        "mdx-content transition-colors duration-300",
        theme === "dark" ? "prose-invert" : "prose",
        "prose prose-lg max-w-none",
        // Custom prose styles
        theme === "dark"
          ? "prose-headings:text-white prose-a:text-blue-400 prose-code:text-zinc-200 prose-pre:bg-zinc-900 prose-blockquote:text-zinc-300"
          : "prose-headings:text-gray-900 prose-a:text-blue-600 prose-code:text-gray-800 prose-pre:bg-gray-50 prose-blockquote:text-gray-700",
        // Responsive
        "prose-sm sm:prose-base lg:prose-lg xl:prose-xl",
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>

      {/* Content footer */}
      <div
        className={`mt-12 pt-8 border-t ${
          theme === "dark" ? "border-zinc-800" : "border-gray-200"
        }`}
      >
        <div
          className={`flex flex-wrap items-center justify-between gap-4 text-sm ${
            theme === "dark" ? "text-zinc-500" : "text-gray-500"
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText size={16} />
            <span>MDX Content</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
