"use client";
import React from "react";
import { cn } from "@/lib/utils";

export function MagicCard({ children, className }) {
  return (
    <div
      className={cn(
        "group relative rounded-[inherit] transition-all duration-300",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent transition-colors duration-300 group-hover:border-blue-500/30" />
      <div className="bg-background absolute inset-px rounded-[inherit]" />
      <div className="relative">{children}</div>
    </div>
  );
}
