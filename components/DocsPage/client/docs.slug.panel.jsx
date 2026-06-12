"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function Panel({ open, mobile, side, panelRef, children }) {
  if (mobile) {
    return (
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-[60px] z-[140] bg-black/40 backdrop-blur-sm"
            />
            {/* Sliding Panel */}
            <motion.div
              initial={{ x: side === "right" ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: side === "right" ? "100%" : "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              ref={panelRef}
              className={`fixed top-[60px] bottom-0 ${
                side === "right" ? "right-0" : "left-0"
              } z-[150] w-[85vw] max-w-[320px] bg-background shadow-2xl flex flex-col border-${side === "right" ? "l" : "r"} border-border`}
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop
  return (
    <aside 
      className={`hidden lg:flex flex-col transition-all duration-300 ${
        open ? "w-72" : "w-0"
      } h-full relative z-[100] border-${side === "right" ? "l" : "r"} border-transparent ${open ? "border-border/50" : ""}`}
      style={{ overflow: open ? 'visible' : 'hidden' }}
    >
      <div className="w-72 h-full flex flex-col bg-background">
        {children}
      </div>
    </aside>
  );
}
