"use client";

import { Copy, Check, MessageSquare, Linkedin, Twitter, ExternalLink, Globe } from "lucide-react";
import { useState } from "react";

export default function PDFShare({ 
  onClose, 
  title, 
  theme 
}) {
  const [copied, setCopied] = useState(false);
  const isDark = theme === "dark";
  const url = typeof window !== "undefined" ? window.location.href : "";

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
       link: `https://wa.me/?text=${encodeURIComponent(title + ": " + url)}` 
    },
    { 
       label: "LinkedIn", 
       icon: <Linkedin className="w-5 h-5" />, 
       color: "bg-[#0A66C2]", 
       link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` 
    },
    { 
       label: "Twitter", 
       icon: <Twitter className="w-5 h-5" />, 
       color: "bg-[#1DA1F2]", 
       link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` 
    }
  ];

  return (
    <div className="absolute inset-0 z-[20000] flex items-center justify-center p-4">
      <div 
         onClick={onClose} 
         className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />
      
      <div className={`
         relative w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden border transition-all duration-300 transform scale-100
         ${isDark ? "bg-[#111113] border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"}
      `}>
        {/* Header */}
        <div className="px-6 pt-6 pb-2 text-center">
           <div className={`mx-auto w-12 h-12 flex items-center justify-center rounded-2xl mb-4 ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}>
              <Globe className="w-6 h-6 text-blue-500" />
           </div>
           <h3 className="text-xl font-black tracking-tight">Share Document</h3>
           <p className={`text-xs mt-1 font-medium ${isDark ? "text-zinc-500" : "text-gray-400"}`}>
              People with the link can view this document
           </p>
        </div>

        {/* Copy Link Section */}
        <div className="p-6">
           <div className={`
              flex items-center gap-2 p-1.5 rounded-xl border transition-all
              ${isDark ? "bg-zinc-900/50 border-white/5" : "bg-gray-50 border-gray-100"}
           `}>
              <div className="flex-1 px-3 py-1 font-mono text-[10px] truncate opacity-60 italic">
                 {url}
              </div>
              <button 
                onClick={handleCopy}
                className={`
                   px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition active:scale-95
                   ${copied 
                      ? "bg-emerald-500 text-white" 
                      : (isDark ? "bg-white text-black hover:bg-zinc-200" : "bg-blue-600 text-white hover:bg-blue-700")}
                `}
              >
                 {copied ? <Check size={14} /> : <Copy size={14} />}
                 {copied ? "COPIED" : "COPY"}
              </button>
           </div>

           <div className="flex items-center gap-3 my-6">
              <div className={`h-px flex-1 ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">or share via</span>
              <div className={`h-px flex-1 ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
           </div>

           <div className="grid grid-cols-3 gap-3">
              {shareOptions.map((opt) => (
                 <a 
                   key={opt.label}
                   href={opt.link}
                   target="_blank"
                   rel="noopener noreferrer"
                   className={`
                      flex flex-col items-center gap-2 p-3 rounded-2xl transition hover:scale-105 active:scale-95
                      ${isDark ? "bg-zinc-900/40 hover:bg-zinc-800" : "bg-gray-50 hover:bg-gray-100"}
                   `}
                 >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${opt.color}`}>
                       {opt.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">
                       {opt.label}
                    </span>
                 </a>
              ))}
           </div>
        </div>

        {/* Done Button */}
        <div className={`p-4 border-t ${isDark ? "border-white/5 bg-zinc-950/30" : "border-gray-50 bg-gray-50/50"}`}>
           <button 
             onClick={onClose}
             className={`
                w-full py-3 rounded-xl font-bold text-sm tracking-wide transition shadow-lg
                ${isDark ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-white text-gray-900 border border-gray-200 hover:shadow-xl"}
             `}
           >
              Done
           </button>
        </div>
      </div>
    </div>
  );
}
