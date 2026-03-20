"use client";

import { X } from "lucide-react";

export default function PDFSidebar({ 
  show, 
  isDark, 
  isMobile,
  onClose,
  Thumbnails 
}) {
  return (
    <aside className={`
       flex-shrink-0 border-r flex flex-col items-center py-4 overflow-hidden transition-all duration-300
       ${isMobile ? "fixed inset-y-0 left-0 z-[10008] shadow-2xl" : "relative"}
       ${show ? (isMobile ? "w-72" : "w-64") : "w-0"}
       ${isDark ? "bg-zinc-900 border-white/10" : "bg-gray-50 border-gray-200"}
    `}>
       {/* Mobile Close Button */}
       {isMobile && show && (
         <button 
           onClick={onClose}
           className="absolute top-2 right-2 p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-red-500 transition"
         >
           <X size={20} />
         </button>
       )}

       <div className={`text-[10px] font-black uppercase tracking-widest mb-4 whitespace-nowrap ${
          isDark ? "text-zinc-500" : "text-gray-400"
       }`}>Page Previews</div>
       
       <div className="flex-1 w-full px-2 overflow-y-auto custom-scrollbar">
          <Thumbnails />
       </div>

       {/* Overlay for mobile when sidebar is open */}
       {isMobile && show && (
         <div 
           onClick={onClose}
           className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[-1] transition-opacity"
         />
       )}
    </aside>
  );
}
