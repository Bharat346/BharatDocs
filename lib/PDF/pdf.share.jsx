"use client";

import { Copy, Check, MessageSquare, Linkedin, Twitter, Instagram } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import img from "../../app/icon.png";

export default function PDFShare({ onClose, title, theme }) {
  const [copied, setCopied] = useState(false);
  const isDark = theme === "dark";
  const url = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      label: "WhatsApp",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "bg-[#25D366]",
      link: `https://wa.me/?text=${encodeURIComponent(title + ": " + url)}`,
    },
    {
      label: "LinkedIn",
      icon: <Linkedin className="w-5 h-5" />,
      color: "bg-[#0A66C2]",
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      label: "X",
      icon: <Twitter className="w-5 h-5" />,
      color: "bg-black",
      link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      label: "Instagram",
      icon: <Instagram className="w-5 h-5" />,
      color: "bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500",
      link: `https://www.instagram.com/`, // IG doesn’t support direct share links
    },
  ];

  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">

      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />

      {/* Modal */}
      <div
        className={`
          relative w-full max-w-sm rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border
          backdrop-blur-xl
          ${isDark
            ? "bg-zinc-900/90 border-zinc-800 text-white"
            : "bg-white/90 border-blue-100 text-gray-900"}
        `}
      >

        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <div className={`
            mx-auto w-11 h-11 flex items-center justify-center rounded-xl mb-3
            ${isDark ? "bg-zinc-800" : "bg-blue-50"}
          `}>
            <Image src={img} alt="Logo" width={100} height={100} />
          </div>

          <h3 className="text-lg font-black tracking-tight">
            Share Document
          </h3>

          <p className={`
            text-xs mt-1 font-medium
            ${isDark ? "text-zinc-400" : "text-blue-600/70"}
          `}>
            Anyone with this link can view
          </p>
        </div>

        {/* Copy Section */}
        <div className="px-6 pb-6">
          <div className={`
            flex items-center gap-2 p-2 rounded-lg border transition
            ${isDark
              ? "bg-zinc-950 border-zinc-800"
              : "bg-blue-50/60 border-blue-100"}
          `}>
            <div className="flex-1 px-2 text-[11px] font-medium truncate opacity-70">
              {url}
            </div>

            <button
              onClick={handleCopy}
              className={`
                px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition
                ${copied
                  ? "bg-emerald-500 text-white"
                  : isDark
                  ? "bg-white text-black hover:bg-zinc-200"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"}
              `}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className={`h-px flex-1 ${isDark ? "bg-zinc-800" : "bg-blue-100"}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">
              Share via
            </span>
            <div className={`h-px flex-1 ${isDark ? "bg-zinc-800" : "bg-blue-100"}`} />
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-4 gap-3">
            {shareOptions.map((opt) => (
              <a
                key={opt.label}
                href={opt.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex flex-col items-center gap-1.5 p-3 rounded-xl transition
                  hover:scale-105 active:scale-95
                  ${isDark
                    ? "hover:bg-zinc-800"
                    : "hover:bg-blue-50"}
                `}
              >
                <div className={`
                  w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm
                  ${opt.color}
                `}>
                  {opt.icon}
                </div>

                <span className="text-[10px] font-semibold opacity-70">
                  {opt.label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`
          p-4 border-t
          ${isDark ? "border-zinc-800" : "border-blue-100"}
        `}>
          <button
            onClick={onClose}
            className={`
              w-full py-2.5 rounded-lg text-sm font-semibold transition
              ${isDark
                ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"}
            `}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}