"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Notebook, Sparkles, ChevronRight } from "lucide-react";
import { shouldPrefetch } from "@/lib/network/network.config";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PARTICLE_COUNT = 30;

export default function HeroSection({ theme }) {
  const isDark = theme === "dark";

  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const particlesRef = useRef(null);
  const badgeRef = useRef(null);

  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 4 + 1,
      opacity: Math.random() * 0.2 + 0.1,
    }));
    setParticles(generated);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Entrance Animations
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
      )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 40, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 1.2 },
          "-=0.6",
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1 },
          "-=0.8",
        )
        .fromTo(
          buttonsRef.current?.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.8 },
          "-=0.6",
        );

      // Floating particles motion
      if (particlesRef.current) {
        particlesRef.current.querySelectorAll(".particle").forEach((p, i) => {
          gsap.to(p, {
            x: `+=${Math.random() * 100 - 50}`,
            y: `+=${Math.random() * 100 - 50}`,
            duration: 6 + Math.random() * 4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.1,
          });
        });
      }

      // Parallax effect for mesh glows
      gsap.to(".mesh-glow", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        y: (i) => (i + 1) * 50,
        rotate: (i) => (i + 1) * 10,
        opacity: 0.5,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [particles]);

  return (
    <section
      ref={containerRef}
      className={`relative min-h-[100dvh] flex items-center justify-center overflow-hidden transition-colors duration-700 ${
        isDark ? "bg-neutral-950" : "bg-white"
      }`}
    >
      {/* Premium Mesh Background */}
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

      {/* Subtle Grid Overlay */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark ? "opacity-[0.1]" : "opacity-[0.4]"
        }`}
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--grid-dot) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`particle absolute rounded-full ${
              isDark ? "bg-sky-400/20" : "bg-blue-500/20"
            }`}
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl px-6 py-20 text-center flex flex-col items-center">
        {/* Badge */}
        <div
          ref={badgeRef}
          className={`flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-medium tracking-tight whitespace-nowrap ${
            isDark
              ? "border-sky-500/20 bg-sky-500/5 text-sky-400"
              : "border-indigo-200/50 bg-indigo-50/50 text-indigo-600"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Intelligent Systems Documentation</span>
        </div>

        {/* Hero Title */}
        <div ref={titleRef} className="max-w-4xl">
          <h1
            className={`text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            Master Your{" "}
            <span className="relative inline-block">
              <span
                className={`relative z-10 bg-clip-text text-transparent bg-gradient-to-r ${
                  isDark
                    ? "from-sky-400 via-blue-400 to-indigo-400"
                    : "from-blue-600 via-indigo-500 to-purple-600"
                }`}
              >
                Workflow
              </span>
              <div
                className={`absolute -bottom-2 left-0 w-full h-3 blur-sm rounded-full -rotate-1 ${
                  isDark ? "bg-sky-500/10" : "bg-blue-500/10"
                }`}
              />
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className={`mt-8 max-w-2xl text-lg sm:text-xl leading-relaxed font-normal ${
            isDark ? "text-neutral-400" : "text-neutral-600"
          }`}
        >
          A high-performance documentation ecosystem designed for clarity,
          structure, and maximum cognitive focus. Built for developers who take
          their knowledge seriously.
        </p>

        {/* Action Buttons */}
        <div
          ref={buttonsRef}
          className="mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link
            href="/docs"
            className="w-full sm:w-auto"
            prefetch={shouldPrefetch()}
          >
            <Button
              size="lg"
              className={`h-14 sm:h-16 w-full sm:min-w-[200px] rounded-2xl shadow-2xl transition-all duration-300 group ${
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
              className={`h-14 sm:h-16 w-full sm:min-w-[200px] rounded-2xl border-2 transition-all duration-300 ${
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

        {/* Feature Highlights */}
        <div
          className={`mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl grayscale group-hover:grayscale-0 transition-all duration-700 ${
            isDark ? "opacity-40" : "opacity-60"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Speed
            </span>
            <div
              className={`h-px w-8 ${
                isDark ? "bg-neutral-700" : "bg-neutral-300"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              Edge Powered
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Search
            </span>
            <div
              className={`h-px w-8 ${
                isDark ? "bg-neutral-700" : "bg-neutral-300"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              Instant Global
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Design
            </span>
            <div
              className={`h-px w-8 ${
                isDark ? "bg-neutral-700" : "bg-neutral-300"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              Focus First
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
