"use client";

import {
  Copy,
  Check,
  MessageSquare,
  Linkedin,
  Twitter,
  Instagram,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export default function PDFShare({ onClose, title, theme }) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isDark = theme === "dark";

  const url =
    typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "unset");
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      label: "WhatsApp",
      icon: <MessageSquare size={18} />,
      bg: "bg-green-500",
      link: `https://wa.me/?text=${encodeURIComponent(
        title + ": " + url
      )}`,
    },
    {
      label: "LinkedIn",
      icon: <Linkedin size={18} />,
      bg: "bg-blue-600",
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}`,
    },
    {
      label: "X",
      icon: <Twitter size={18} />,
      bg: "bg-black",
      link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        title
      )}&url=${encodeURIComponent(url)}`,
    },
    {
      label: "Instagram",
      icon: <Instagram size={18} />,
      bg: "bg-pink-500",
      link: `https://www.instagram.com/`,
    },
  ];

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-sm rounded-3xl border transition-all duration-300
        ${
          isDark
            ? "bg-zinc-900 border-zinc-800 text-white"
            : "bg-white border-neutral-200 text-neutral-900"
        }`}
      >
        {/* Header */}
        <div className="pt-8 pb-4 text-center">
          <div
            className={`mx-auto w-12 h-12 flex items-center justify-center rounded-xl mb-4
            ${
              isDark
                ? "bg-zinc-800"
                : "bg-neutral-100"
            }`}
          >
            <img src="/icon.png" alt="Logo" />
          </div>

          <h3 className="text-xl font-semibold">Share</h3>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-5">
          {/* URL Copy */}
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm
            ${
              isDark
                ? "bg-black border-zinc-800"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <span className="flex-1 truncate opacity-70">
              {url}
            </span>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition
              ${
                copied
                  ? "bg-emerald-500 text-white"
                  : isDark
                  ? "bg-white text-black hover:bg-neutral-200"
                  : "bg-black text-white hover:bg-neutral-800"
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* Divider */}
          <div className="text-center text-[10px] uppercase tracking-widest opacity-50">
            Share via
          </div>

          {/* Socials */}
          <div className="flex justify-between">
            {shareOptions.map((opt) => (
              <a
                key={opt.label}
                href={opt.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 group"
              >
                <div
                  className={`w-11 h-11 flex items-center justify-center rounded-xl text-white ${opt.bg}
                  transition-all duration-200 group-hover:scale-105`}
                >
                  {opt.icon}
                </div>

                <span className="text-[10px] opacity-60 group-hover:opacity-100 transition">
                  {opt.label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`border-t p-4 ${
            isDark ? "border-zinc-800" : "border-neutral-200"
          }`}
        >
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl text-sm font-medium transition active:scale-95
            ${
              isDark
                ? "bg-zinc-800 hover:bg-zinc-700"
                : "bg-neutral-100 hover:bg-neutral-200"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}