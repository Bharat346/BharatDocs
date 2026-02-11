"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, ExternalLink, ChevronRight } from "lucide-react";
import Link from "next/link";
import { shouldPrefetch } from "@/lib/network/network.config";
import { useThemeContext } from "@/components/ThemeProvider";

const DOT_COUNT = 48;

export default function CTASection() {
  const { theme } = useThemeContext();
  const isDark = theme === "dark";

  /* =========================
     Floating dots (client only)
  ========================= */
  const [dots, setDots] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: DOT_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 1.5,
      delay: Math.random() * 4,
    }));

    setDots(generated);
  }, []);

  /* =========================
     Email Handler
  ========================= */
  const openEmail = () => {
    const email = "bharat030406@gmail.com";
    const subject = encodeURIComponent("Project Inquiry");
    const body = encodeURIComponent(
      "Hi Bharat,\n\nI would like to discuss a project with you.\n\nThanks!"
    );

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = mailtoUrl;
      return;
    }

    const win = window.open(gmailUrl, "_blank", "noopener,noreferrer");
    if (!win) window.location.href = mailtoUrl;
  };

  return (
    <section
      className={`relative overflow-hidden py-24 sm:py-28 lg:py-32 ${
        isDark ? "bg-neutral-950" : "bg-white"
      }`}
    >
      {/* Floating Dots */}
      <div className="absolute inset-0 pointer-events-none">
        {dots.map((dot) => (
          <motion.span
            key={dot.id}
            className="absolute rounded-full"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: dot.size,
              height: dot.size,
              backgroundColor: isDark
                ? "rgba(34,211,238,0.3)"
                : "rgba(37,99,235,0.2)",
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              opacity: [0.25, 0.7, 0.25],
            }}
            transition={{
              duration: 10 + Math.random() * 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: dot.delay,
            }}
          />
        ))}
      </div>

      {/* Theme-aware radial depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(circle at center, rgba(56,189,248,0.08), transparent 60%)"
            : "radial-gradient(circle at center, rgba(37,99,235,0.06), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {/* Gradient Border Frame */}
          <div
            className={`relative rounded-3xl p-[1px] ${
              isDark
                ? "bg-gradient-to-br from-sky-400/40 via-indigo-400/20 to-transparent"
                : "bg-gradient-to-br from-blue-500/30 via-indigo-400/15 to-transparent"
            }`}
          >
            <div
              className={`rounded-3xl backdrop-blur-xl px-8 py-12 sm:px-12 sm:py-14 lg:px-16 ${
                isDark
                  ? "bg-neutral-900/85 border border-neutral-800 text-white"
                  : "bg-white/85 border border-neutral-200 text-neutral-900"
              }`}
            >
              {/* Heading */}
              <h2 className="text-center font-mono tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-tight">
                Let’s Build Something
                <span className="block mt-3 bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  Exceptional Together
                </span>
              </h2>

              {/* Description */}
              <p
                className={`mt-7 text-center max-w-2xl mx-auto text-base sm:text-lg leading-relaxed font-mono ${
                  isDark ? "text-neutral-300" : "text-neutral-600"
                }`}
              >
                Have an idea, a system to optimize, or a product to build?
                Let’s collaborate and create something engineered for performance,
                clarity, and long-term value.
              </p>

              {/* Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-5 justify-center">
                <Button
                  size="lg"
                  onClick={openEmail}
                  className="group w-full sm:w-auto min-w-44 px-10 py-6 rounded-2xl
                             border-2 border-sky-400 text-sky-400 bg-transparent
                             hover:bg-sky-400 hover:text-neutral-900
                             transition-all duration-300"
                >
                  <Mail className="w-5 h-5 mr-3 group-hover:-translate-y-0.5 transition-transform" />
                  Email Me
                </Button>

                <Link
                  href="https://portfolio.bhdocs.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  prefetch={shouldPrefetch()}
                >
                  <Button
                    size="lg"
                    className="group w-full sm:w-auto min-w-44 px-10 py-6 rounded-2xl
                               border-2 border-indigo-400 text-indigo-400 bg-transparent
                               hover:bg-indigo-400 hover:text-neutral-900
                               transition-all duration-300"
                  >
                    <ExternalLink className="w-5 h-5 mr-3 opacity-80" />
                    View Portfolio
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Divider */}
              <div
                className={`mt-12 pt-8 border-t ${
                  isDark ? "border-neutral-800" : "border-neutral-200"
                }`}
              >
                <p className="text-center text-xs uppercase tracking-[0.3em] text-neutral-500 font-mono">
                  Bharat • Full Stack Engineer • React • Next.js • Systems Design
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
