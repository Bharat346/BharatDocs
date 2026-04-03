"use client";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { shouldPrefetch } from "@/lib/network/network.config";

export default function NavLogo({ theme }) {
  return (
    <Link
      href="/"
      prefetch={shouldPrefetch()}
      className="flex items-center gap-3 group"
    >
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
        className="h-10 w-10 p-1 rounded-xl bg-white shadow-lg overflow-hidden flex items-center justify-center border border-zinc-100"
      >
        <img
          src="/icon.png"
          alt="Logo"
          className="w-full h-full object-contain"
        />
      </motion.div>
      <span
        suppressHydrationWarning
        className={`text-[clamp(1.05rem,4vw,1.3rem)] font-bold tracking-tight ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        Bharat Docs
      </span>
    </Link>
  );
}
