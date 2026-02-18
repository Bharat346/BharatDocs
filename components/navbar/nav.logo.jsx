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
        className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg"
      >
        <BookOpen className="h-6 w-6 text-white" />
      </motion.div>
      <span
        suppressHydrationWarning
        className={`font-mono text-xl bg-clip-text text-transparent bg-gradient-to-r ${
          theme === "dark"
            ? "from-white to-gray-300"
            : "from-gray-900 to-gray-700"
        }`}
      >
        Bharat Docs
      </span>
    </Link>
  );
}
