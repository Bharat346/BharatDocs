"use client";

import React, { useState } from "react";
import { 
  Copy, 
  Check, 
  MessageSquare, 
  Linkedin, 
  Instagram, 
  Share2,
  Reddit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { FaReddit } from "react-icons/fa";

export default function ShareDropdown({ title, url }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 !fill-emerald-500">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      href: `https://wa.me/?text=${encodeURIComponent(title + ": " + url)}`,
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-4 h-4 !text-blue-600" />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: "Reddit",
      icon: <FaReddit className="w-5 h-5 !text-[#FF4500]" />,
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    },
    {
      name: "Instagram",
      icon: <Instagram className="w-4 h-4 !text-pink-500" />,
      href: `https://www.instagram.com/`,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2.5 rounded-xl transition-all hidden sm:flex bg-secondary-bg border border-border/50 text-neutral-500 hover:text-primary hover:border-primary/30"
          title="Share"
        >
          <Share2 className="w-[17px] h-[17px]" strokeWidth={1.8} />
        </button>

      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2 rounded-[1.5rem] bg-background border-border text-foreground shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-[9999999]">

        <DropdownMenuItem 
          onClick={handleCopy}
          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-secondary-bg transition-colors group"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary-bg group-hover:bg-primary group-hover:text-white transition-colors">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </div>
          <span className="font-semibold text-sm">{copied ? "Copied Link" : "Copy Link"}</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-1 bg-border/50" />
        
        {shareOptions.map((opt) => (
          <DropdownMenuItem
            key={opt.name}
            asChild
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-secondary-bg transition-colors group"
          >
            <a href={opt.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary-bg group-hover:scale-110 transition-transform">
                {opt.icon}
              </div>
              <span className="font-semibold text-sm">{opt.name}</span>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
