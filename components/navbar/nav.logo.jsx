"use client";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { shouldPrefetch } from "@/lib/network/network.config";

export default function NavLogo({ theme }) {
  return (
    <Link
      href="/"
      prefetch={shouldPrefetch()}
      className="flex items-center gap-3 group"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="h-10 w-10 overflow-hidden flex items-center justify-center transition-all duration-300 rounded-xl border-2 border-border/40 bg-secondary-bg"
      >
        <img
          src={theme === "dark" ? "/icon2.png" : "/icon.png"}
          alt="Logo"
          className="w-full h-full object-contain p-1"
        />
      </motion.div>

      <span
        suppressHydrationWarning
        className={`text-[clamp(1.05rem,4vw,1.3rem)] font-black tracking-tight ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        Bharat Docs
      </span>
    </Link>
  );
}
