"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import MobileAccordion from "./mobileAccordion";

export default function NavMobile({ isOpen, navItems, theme, closeMobile }) {
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
              ? "bg-black/100 border-gray-800"
              : "bg-white border-gray-200"
          } backdrop-blur-xl`}
        >
          <div className="px-4 py-3 space-y-2">
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
