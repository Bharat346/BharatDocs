"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight, Notebook } from "lucide-react";
import { shouldPrefetch } from "@/lib/network/network.config";

export default function HeroSection({ theme }) {
  const isDark = theme === "dark";

  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const badgeRef = useRef(null);

  // Entrance animations
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
      )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 40, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 1 },
          "-=0.4",
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.6",
        )
        .fromTo(
          buttonsRef.current?.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 },
          "-=0.5",
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className={`relative min-h-[100dvh] flex items-center justify-center ${
        isDark ? "bg-[var(--color-bg)]" : "bg-[var(--color-bg)]"
      }`}
    >
      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl px-6 py-24 text-center flex flex-col items-center">
        {/* Badge */}
        <div
          ref={badgeRef}
          className={`flex items-center gap-2 mb-10 px-5 py-2 rounded-full border text-[11px] font-mono tracking-wider uppercase ${
            isDark
              ? "border-neutral-700 bg-neutral-900 text-neutral-400"
              : "border-neutral-200 bg-neutral-50 text-neutral-600"
          }`}
        >
          <Sparkles className="w-3 h-3" />
          Bharat DOCS
        </div>

        {/* Title */}
        <div ref={titleRef} className="max-w-4xl">
          <h1
            className={`text-[clamp(2.5rem,10vw,6rem)] font-bold tracking-tight leading-[1.05] ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            Bharat{" "}
            <span className={`${isDark ? "text-blue-400" : "text-blue-600"}`}>
              Docs
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className={`mt-8 max-w-2xl text-[clamp(1rem,2vw,1.25rem)] leading-relaxed ${
            isDark ? "text-neutral-400" : "text-neutral-600"
          }`}
        >
          A high-performance documentation ecosystem designed for clarity,
          structure, and maximum cognitive focus. Built for developers who take
          their knowledge seriously.
        </p>

        {/* Buttons */}
        <div
          ref={buttonsRef}
          className="mt-14 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link
            href="/docs"
            className="w-full sm:w-auto"
            prefetch={shouldPrefetch()}
          >
            <Button
              size="lg"
              className={`tracking-wide h-14 sm:h-16 w-full sm:min-w-[220px] rounded-xl shadow-xl transition-all duration-300 group ${
                isDark
                  ? "bg-white text-neutral-950 hover:bg-neutral-200"
                  : "bg-neutral-950 text-white hover:bg-neutral-800"
              }`}
            >
              Read Docs
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <Link
            href="/notes"
            className="w-full sm:w-auto"
            prefetch={shouldPrefetch()}
          >
            <Button
              variant="outline"
              size="lg"
              className={`tracking-wide h-14 sm:h-16 w-full sm:min-w-[220px] rounded-xl border-2 transition-all duration-300 ${
                isDark
                  ? "border-neutral-800 bg-transparent text-white hover:bg-neutral-900"
                  : "border-neutral-200 bg-transparent text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              <Notebook className="mr-2 w-5 h-5" />
              Browse Notes
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
