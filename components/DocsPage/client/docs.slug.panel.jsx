"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function Panel({ open, mobile, side, panelRef, children }) {
  if (mobile) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: side === "right" ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: side === "right" ? "100%" : "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            ref={panelRef}
            className={`fixed top-16 bottom-0 ${
              side === "right" ? "right-0" : "left-0"
            } z-[150] w-72 bg-white dark:bg-[#0a0a0a] shadow-2xl flex flex-col`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Desktop
  return (
    <aside 
      className={`hidden lg:flex flex-col transition-all duration-300 overflow-hidden ${
        open ? "w-72" : "w-0"
      } h-full relative z-20`}
    >
      <div className="w-72 h-full flex flex-col">
        {children}
      </div>
    </aside>
  );
}
