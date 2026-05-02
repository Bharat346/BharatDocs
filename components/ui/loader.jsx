"use client";
import { motion } from "framer-motion";

export default function BharatLoader({ text = "Loading...", className = "", small = false }) {
  if (small) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="h-4 w-4 rounded-full border-2 border-blue-600/20 border-t-blue-600"
        />
        {text && <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600/80 dark:text-blue-500/80">{text}</span>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-[40vh] gap-4 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="h-10 w-10 rounded-full border-[3px] border-blue-600/10 border-t-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
      />
      {text && (
        <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-blue-600/70 dark:text-blue-500/70 animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
}
