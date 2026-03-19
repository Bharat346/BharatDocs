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
        className="p-2.5 rounded-xl bg-blue-600 shadow-lg"
      >
        <BookOpen className="h-6 w-6 text-white" />
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
