"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {shouldPrefetch} from "@/lib/network/network.config";


export default function MobileAccordion({
  item,
  theme,
  isOpen,
  toggle,
  closeMobile,
}) {
  const hasChildren = item.children;
  const hasStructure = item.structure;

  return (
    <div className="space-y-1">
      {/* Parent Row */}
      <div className="flex items-center">
        <Link
          href={item.href}
          onClick={closeMobile}
          prefetch={shouldPrefetch()}
          className={`flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-mono transition-all ${
            theme === "dark"
              ? "text-gray-300 hover:bg-black/50 hover:text-white"
              : "text-gray-700 hover:bg-black/50  hover:text-gray-900"
          }`}
        >
          {item.icon && <item.icon className="h-5 w-5" />}
          {item.label}
        </Link>

        {(hasChildren || hasStructure) && (
          <button
            onClick={() => toggle(item.label)}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-gray-800/50 text-gray-400"
                : "hover:bg-gray-100/80 text-gray-500"
            }`}
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>

      {/* Nested Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {/* Simple children (Documents) */}
            {hasChildren && (
              <div className="ml-6 pl-4 border-l space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.label}
                    href={child.href}
                    onClick={closeMobile}
                    prefetch={shouldPrefetch()}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono transition-all ${
                      theme === "dark"
                        ? "text-gray-400 hover:bg-gray-800/30 hover:text-white"
                        : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
                    }`}
                  >
                    {child.icon && <child.icon className="h-4 w-4" />}
                    {child.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Structured (Notes Mega Menu) */}
            {hasStructure && (
              <div className="space-y-6 pb-4">
                {item.structure.map((category) => (
                  <div key={category.title} className="space-y-3">
                    <div className="flex items-center gap-2 px-6">
                      <category.icon
                        className={`h-4 w-4 ${
                          theme === "dark" ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                      <span
                        className={`text-xs font-bold uppercase tracking-widest ${
                          theme === "dark" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        {category.title}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 px-4">
                      {category.subjects.map((subject) => (
                        <Link
                          key={subject.name}
                          href={subject.href}
                          onClick={closeMobile}
                          prefetch={shouldPrefetch()}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all font-mono ${
                            theme === "dark"
                              ? "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                              : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                          }`}
                        >
                          {subject.icon && (
                            <subject.icon className="h-3.5 w-3.5" />
                          )}
                          <span className="truncate">{subject.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
