"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { shouldPrefetch } from "@/lib/network/network.config";

export default function NavItem({
  item,
  theme,
  activeDropdown,
  setActiveDropdown,
  children,
}) {
  const isActive = activeDropdown === item.label;
  const hasDropdown = item.children || item.structure;
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(item.label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 300); // 300ms delay before closing
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={item.href}
        prefetch={true}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        suppressHydrationWarning
        className={`group relative px-4 py-2.5 rounded-xl flex items-center gap-2 font-semibold text-sm tracking-wide transition-all duration-300 ${
          theme === "dark"
            ? "text-neutral-400 hover:text-white hover:bg-white/10"
            : "text-neutral-600 hover:text-neutral-900 hover:bg-black/5"
        }`}
      >
        {item.icon && (
          <item.icon
            className={`h-4 w-4 transition-colors ${
              isActive
                ? "text-blue-500"
                : "text-gray-500 group-hover:text-blue-400"
            }`}
          />
        )}
        {item.label}

        {hasDropdown && (
          <ChevronDown
            className={`h-3 w-3 transition-transform duration-300 ${
              isActive ? "rotate-180" : ""
            }`}
          />
        )}

        {/* underline animation */}
        <span
          className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-0 rounded-full bg-blue-500 transition-all duration-300 ${
            isActive ? "w-8" : "group-hover:w-8"
          }`}
        />
      </Link>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: 10, x: "-50%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-1/2 pt-2 z-50"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
