"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, ExternalLink, ChevronRight } from "lucide-react";
import Link from "next/link";

const DOT_COUNT = 48;

export default function CTASection({ theme }) {
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
      "Hi Bharat,\n\nI would like to discuss a project with you.\n\nThanks!",
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
      className={`relative overflow-hidden py-20 sm:py-24 lg:py-28 ${
        isDark ? "bg-neutral-950" : "bg-white"
      }`}
    >
      {/* ------------------------------
          FLOATING DOTS BACKGROUND
      ------------------------------ */}
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
                ? "rgba(34,211,238,0.35)" // cyan-400
                : "rgba(37,99,235,0.25)", // blue-600
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              opacity: [0.3, 0.8, 0.3],
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

      {/* Soft depth fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 dark:to-black/40" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {/* Glass Card */}
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-sky-400/30 to-indigo-400/20">
            <div
              className={`rounded-3xl backdrop-blur-xl shadow-xl
                px-6 py-10 sm:px-10 sm:py-12 lg:px-14
                ${
                  isDark
                    ? "bg-neutral-900/85 border border-neutral-800 text-white"
                    : "bg-white/90 border border-neutral-200 text-neutral-900"
                }
              `}
            >
              {/* Heading */}
              <h2 className="text-center font-mono tracking-tight text-3xl sm:text-4xl lg:text-5xl">
                Let’s Build Something
                <span className="block mt-2 bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  Exceptional Together
                </span>
              </h2>

              {/* Description */}
              <p
                className={`mt-5 sm:mt-6 text-center max-w-2xl mx-auto
                  text-base sm:text-lg font-mono
                  ${isDark ? "text-neutral-300" : "text-neutral-600"}
                `}
              >
                Questions, ideas, or opportunities? I’d love to hear from you and
                help you get the most out of Bharat Docs.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={openEmail}
                  className="
                    group w-full sm:w-auto px-9 py-6 rounded-2xl
                    border-2 border-sky-400 text-sky-400 bg-transparent
                    hover:bg-sky-400 hover:text-neutral-900
                    transition-all duration-300
                  "
                >
                  <Mail className="w-5 h-5 mr-3 group-hover:-translate-y-0.5 transition-transform" />
                  Email Me
                </Button>

                <Link
                  href="https://portfolio.bhdocs.in"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="
                      group w-full sm:w-auto px-9 py-6 rounded-2xl
                      border-2 border-indigo-400 text-indigo-400 bg-transparent
                      hover:bg-indigo-400 hover:text-neutral-900
                      transition-all duration-300
                    "
                  >
                    <ExternalLink className="w-5 h-5 mr-3 opacity-80" />
                    View Portfolio
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Footer */}
              <div
                className={`mt-10 sm:mt-12 pt-6 sm:pt-8 border-t ${
                  isDark ? "border-neutral-800" : "border-neutral-200"
                }`}
              >
                <p className="text-center text-[11px] sm:text-xs uppercase tracking-widest text-neutral-500 font-mono">
                  Bharat • Full Stack Developer • React & Next.js
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
