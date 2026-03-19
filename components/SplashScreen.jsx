"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for the page to be fully interactive
    const handleReady = () => {
      // Small extra delay for JS hydration to settle
      setTimeout(() => setIsLoading(false), 2000); // 1 seconds
    };

    if (document.readyState === "complete") {
      handleReady();
    } else {
      window.addEventListener("load", handleReady);
      return () => window.removeEventListener("load", handleReady);
    }

    // Fallback: dismiss after 3s no matter what
    const fallback = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(fallback);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
            style={{ willChange: "opacity" }}
          >
            <div className="flex flex-col items-center gap-6">
              {/* Animated Logo Icon */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative"
              >
                {/* Pulsing ring */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-2xl bg-indigo-500/20"
                />

                {/* Logo container */}
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-2xl shadow-indigo-500/30 flex items-center justify-center">
                  <motion.img
                    src="/icon.png"
                    alt="Bharat Docs"
                    className="w-12 h-12 object-contain drop-shadow-lg"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </motion.div>

              {/* Brand name */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center"
              >
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Bharat{" "}
                  <span className="text-indigo-600">
                    Docs
                  </span>
                </h2>
              </motion.div>

              {/* Loading bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="w-48 h-1 bg-neutral-200 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.2, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always render children underneath so they can hydrate */}
      <div
        style={{
          visibility: isLoading ? "hidden" : "visible",
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      >
        {children}
      </div>
    </>
  );
}
