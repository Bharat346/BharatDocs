"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight, Notebook } from "lucide-react";
import { shouldPrefetch } from "@/lib/network/network.config";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HeroSection({ theme }) {
  const isDark = theme === "dark";

  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const badgeRef = useRef(null);

  // Animations
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 }
      )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 40, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 1 },
          "-=0.4"
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.6"
        )
        .fromTo(
          buttonsRef.current?.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 },
          "-=0.5"
        );

      gsap.to(".mesh-glow", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        y: (i) => (i + 1) * 40,
        rotate: (i) => (i + 1) * 6,
        opacity: 0.6,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className={`relative min-h-[100dvh] flex items-center justify-center overflow-hidden transition-colors duration-700 ${
        isDark ? "bg-neutral-950" : "bg-white"
      }`}
    >
      {/* Mesh Glow Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`mesh-glow absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] ${
            isDark ? "mix-blend-lighten" : "mix-blend-multiply"
          }`}
          style={{ backgroundColor: "var(--hero-glow-1)" }}
        />
        <div
          className={`mesh-glow absolute top-[20%] -right-[5%] w-[45%] h-[45%] rounded-full blur-[100px] ${
            isDark ? "mix-blend-lighten" : "mix-blend-multiply"
          }`}
          style={{ backgroundColor: "var(--hero-glow-2)" }}
        />
        <div
          className={`mesh-glow absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full blur-[110px] ${
            isDark ? "mix-blend-lighten" : "mix-blend-multiply"
          }`}
          style={{ backgroundColor: "var(--hero-glow-3)" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl px-6 py-24 text-center flex flex-col items-center">
        {/* Badge */}
        <div
          ref={badgeRef}
          className={`flex items-center gap-2 mb-10 px-5 py-2 rounded-full border text-[11px] font-mono tracking-wider uppercase ${
            isDark
              ? "border-sky-500/20 bg-sky-500/5 text-sky-400"
              : "border-indigo-200/60 bg-indigo-50/60 text-indigo-600"
          }`}
        >
          <Sparkles className="w-3 h-3" />
          Bharat DOCS
        </div>

        {/* Title */}
        <div ref={titleRef} className="max-w-4xl">
          <h1
            className={`font-roboto text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            Master Your{" "}
            <span
              className={`bg-clip-text text-transparent bg-gradient-to-r ${
                isDark
                  ? "from-sky-400 via-blue-400 to-indigo-400"
                  : "from-blue-600 via-indigo-500 to-purple-600"
              }`}
            >
              Workflow
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className={`mt-8 max-w-2xl font-roboto text-base sm:text-lg leading-relaxed ${
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
              className={`font-roboto tracking-wide h-14 sm:h-16 w-full sm:min-w-[220px] rounded-xl shadow-xl transition-all duration-300 group ${
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
              className={`font-roboto tracking-wide h-14 sm:h-16 w-full sm:min-w-[220px] rounded-xl border-2 transition-all duration-300 ${
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

        {/* Feature Grid */}
        <div
          className={`mt-14 grid overflow-hidden grid-cols-1 sm:grid-cols-3 gap-10 w-full max-w-4xl ${
            isDark ? "opacity-50" : "opacity-70"
          }`}
        >
          {[
            { label: "Speed", value: "Edge Powered" },
            { label: "Search", value: "Instant Global" },
            { label: "Design", value: "Focus First" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <span className="font-mono text-[11px] tracking-widest uppercase text-neutral-500">
                {item.label}
              </span>
              <div
                className={`h-px w-10 ${
                  isDark ? "bg-neutral-700" : "bg-neutral-300"
                }`}
              />
              <span
                className={`font-roboto text-sm font-medium ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
