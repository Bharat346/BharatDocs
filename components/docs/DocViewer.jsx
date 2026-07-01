"use client";

import { useEffect, useState } from "react";
import { motion, useScroll } from "framer-motion";

export default function DocViewer({ content }) {
  const { scrollYProgress } = useScroll();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* Reading Progress Bar */}
      {mounted && (
        <motion.div
          className="reading-progress"
          style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
        />
      )}

      {/* Content wrapper */}
      <article className="prose prose-slate dark:prose-invert max-w-none w-full animate-fade-in-up">
        {content}
      </article>
    </>
  );
}
