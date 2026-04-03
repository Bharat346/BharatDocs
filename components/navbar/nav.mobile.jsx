"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import MobileAccordion from "./mobileAccordion";

export default function NavMobile({ isOpen, navItems, theme, toggleTheme, closeMobile }) {
  const [openCategories, setOpenCategories] = useState([]);

  const toggleCategory = (label) => {
    setOpenCategories((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          suppressHydrationWarning
          className={`lg:hidden absolute top-full left-0 right-0 ${
            theme === "dark"
              ? "bg-[#121212] border-gray-800"
              : "bg-white border-gray-200"
          } backdrop-blur-xl border-b shadow-xl`}
        >
          <div className="px-4 py-6 space-y-4">
            {navItems.map((item) => (
              <MobileAccordion
                key={item.label}
                item={item}
                theme={theme}
                isOpen={openCategories.includes(item.label)}
                toggle={toggleCategory}
                closeMobile={closeMobile}
              />
            ))}

            {/* Dark Mode Toggle for Mobile */}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                    onClick={toggleTheme}
                    className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all ${
                        theme === 'dark' ? 'bg-zinc-800/50 text-yellow-400' : 'bg-gray-100 text-gray-700'
                    }`}
                >
                    <span className="font-bold uppercase tracking-widest text-xs">
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </span>
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
