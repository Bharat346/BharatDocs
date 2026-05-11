"use client";
import { motion } from "framer-motion";

export default function BharatLoader({
  className = "",
  fullScreen = true,
  pipeline = 0, // 0 to 3
}) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md"
    : `flex flex-col items-center justify-center w-full h-full min-h-[20vh] gap-8 ${className}`;

  return (
    <div className={containerClasses}>
      <div className="relative flex flex-col items-center gap-10">
        {/* Simple Doughnut Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-primary/10 border-t-primary"
        />

        {/* Pipeline Progress (1 -- 2 -- 3) */}
        {pipeline > 0 && (
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((step, i) => (
              <div key={step} className="flex items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: pipeline >= step ? 1.2 : 1,
                    backgroundColor: pipeline >= step ? "var(--primary)" : "var(--border)",
                  }}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                    pipeline >= step ? "text-white" : "text-foreground/20"
                  }`}
                >
                  {step}
                </motion.div>
                {i < 2 && (
                  <div className="w-12 h-[2px] mx-1 relative overflow-hidden bg-border rounded-full">
                    {/* Active line with glow */}
                    {pipeline > i + 1 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        className="absolute inset-0 bg-primary shadow-[0_0_10px_var(--primary)] z-10"
                      />
                    )}
                    {/* Progress scanning effect for the NEXT line */}
                    {pipeline === i + 1 && (
                      <motion.div
                        initial={{ left: "-100%" }}
                        animate={{ left: "100%" }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-primary/30"
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
