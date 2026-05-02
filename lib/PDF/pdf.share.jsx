"use client";

import {
  Copy,
  Check,
  Linkedin,
  Twitter,
  Instagram,
} from "lucide-react";
import { FaReddit, FaWhatsapp } from "react-icons/fa";
import React, { useState, useEffect } from "react";
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
      icon: <FaWhatsapp className="text-emerald-500" />,
      link: `https://wa.me/?text=${encodeURIComponent(
        title + ": " + url
      )}`,
    },
    {
      label: "LinkedIn",
      icon: <Linkedin className="text-blue-600" />,
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}`,
    },
    {
      label: "Reddit",
      icon: <FaReddit className="text-orange-500" />,
      link: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    },
    {
      label: "Instagram",
      icon: <Instagram className="text-pink-500" />,
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
              {/* {copied ? "Copied" : "Copy"} */}
            </button>
          </div>

          {/* Socials */}
          <div className="flex flex-col items-center gap-4">
            {shareOptions.map((opt) => (
              <a
                key={opt.label}
                href={opt.link}
                target="_blank"
                rel="noopener noreferrer"
                title={opt.label}
                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-neutral-100 dark:bg-zinc-800 hover:bg-neutral-200 dark:hover:bg-zinc-700 transition-all group"
              >
                <div className="text-2xl transition-transform group-hover:scale-110">
                  {opt.icon}
                </div>
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