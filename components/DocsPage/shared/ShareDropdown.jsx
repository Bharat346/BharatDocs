"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Linkedin,
  Instagram,
  Share2,
} from "lucide-react";
import { FaReddit, FaWhatsapp } from "react-icons/fa";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

export default function ShareDropdown({ title, url }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: <FaWhatsapp className="text-emerald-500" />,
      href: `https://wa.me/?text=${encodeURIComponent(title + ": " + url)}`,
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="text-blue-600" />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: "Reddit",
      icon: <FaReddit className="text-orange-500" />,
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    },
    {
      name: "Instagram",
      icon: <Instagram className="text-pink-500" />,
      href: `https://www.instagram.com/`,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2.5 rounded-xl bg-secondary-bg border border-border/50 text-neutral-500 hover:text-primary hover:border-primary/30 transition-all">
          <Share2 className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-fit p-2 rounded-2xl bg-background border border-border shadow-2xl flex flex-col items-center gap-2 z-[9999999]"
      >
        {/* COPY */}
        {/* <DropdownMenuItem asChild> */}
          <button
            onClick={handleCopy}
            title="Copy"
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-secondary-bg hover:bg-muted transition-all group cursor-pointer outline-none"
          >
            {copied ? (
              <Check className="w-5 h-5 text-emerald-500" />
            ) : (
              <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
          </button>
        {/* </DropdownMenuItem> */}

        {/* DIVIDER */}
        <div className="w-6 h-px bg-border my-1" />

        {/* SHARE ICONS */}
        {shareOptions.map((opt) => (
          <DropdownMenuItem key={opt.name} asChild>
            <a
              href={opt.href}
              target="_blank"
              rel="noopener noreferrer"
              title={opt.name}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-secondary-bg hover:bg-muted transition-all group cursor-pointer outline-none"
            >
              <div className="text-2xl group-hover:scale-110 transition-transform">
                {opt.icon}
              </div>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}