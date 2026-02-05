"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Terminal,
  TypingAnimation,
  AnimatedSpan,
} from "@/components/ui/terminal";
import { ArrowRight, BookOpen, Notebook } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PARTICLE_COUNT = 48;

export default function HeroSection({ theme }) {
  const isDark = theme === "dark";

  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const particlesRef = useRef(null);

  /* ------------------------------
     Particle state (hydration safe)
  ------------------------------ */
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 5 + 1,
      opacity: isDark
        ? Math.random() * 0.25 + 0.1
        : Math.random() * 0.15 + 0.05,
    }));

    setParticles(generated);
  }, [isDark]);

  /* ------------------------------
     GSAP animations
  ------------------------------ */
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 80, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.4,
          ease: "power4.out",
        },
      );

      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          delay: 0.5,
        },
      );

      gsap.fromTo(
        buttonsRef.current?.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.6,
          delay: 0.9,
          ease: "back.out(1.8)",
        },
      );

      if (particlesRef.current) {
        particlesRef.current.querySelectorAll(".particle").forEach((p, i) => {
          gsap.to(p, {
            x: `+=${Math.random() * 120 - 60}`,
            y: `+=${Math.random() * 120 - 60}`,
            duration: 4 + Math.random() * 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.08,
          });
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [particles]);

  return (
    <section
      ref={containerRef}
      className={`relative min-h-screen overflow-hidden ${
        isDark ? "bg-neutral-950" : "bg-white"
      }`}
    >
      {/* ------------------------------
          DOTTED BACKGROUND ACCENTS
      ------------------------------ */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark ? "opacity-[0.15]" : "opacity-[0.25]"
        }`}
        style={{
          backgroundImage:
            "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          color: isDark ? "#38bdf8" : "#2563eb",
        }}
      />

      {/* ------------------------------
          PARTICLES
      ------------------------------ */}
      <div ref={particlesRef} className="absolute inset-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: isDark
                ? `rgba(56,189,248,${p.opacity})`
                : `rgba(37,99,235,${p.opacity})`,
            }}
          />
        ))}
      </div>

      {/* ------------------------------
          MAIN CONTENT
      ------------------------------ */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-8 sm:pb-20">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2 gap-14 items-center">
          {/* LEFT */}
          <div className="space-y-10 text-center lg:text-left">
            <div ref={titleRef}>
              <h1
                className={`font-mono text-5xl sm:text-6xl xl:text-7xl tracking-tight ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  Bharat
                </span>{" "}
                Docs
              </h1>
            </div>

            <p
              ref={subtitleRef}
              className={`max-w-2xl mx-auto lg:mx-0 font-mono text-lg sm:text-xl leading-relaxed ${
                isDark ? "text-neutral-300" : "text-neutral-600"
              }`}
            >
              A focused platform for documentation and notes — built for speed,
              clarity, and long-term knowledge retention.
            </p>

            {/* BUTTONS */}
            <div
              ref={buttonsRef}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              {/* Docs */}
              <Link href="/docs">
                <Button
                  size="lg"
                  className="h-14 min-w-40 px-9 rounded-2xl border-2 border-sky-400 text-sky-400 bg-transparent
                             hover:bg-sky-400 hover:text-neutral-900
                             transition-all duration-300"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Docs
                </Button>
              </Link>

              {/* Notes */}
              <Link href="/notes">
                <Button
                  size="lg"
                  className="h-14 px-9 min-w-40 rounded-2xl border-2 border-indigo-400 text-indigo-400 bg-transparent
                             hover:bg-indigo-400 hover:text-neutral-900
                             transition-all duration-300"
                >
                  <Notebook className="mr-2 h-5 w-5" />
                  Visit Notes
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT – TERMINAL */}
          <div className="flex justify-center lg:justify-end">
            <Terminal
              className={`max-w-lg w-full ${
                isDark
                  ? "bg-neutral-900 text-white"
                  : "bg-gray-100 text-neutral-900"
              }`}
            >
              <TypingAnimation className="text-emerald-400 font-mono">
                $ welcome to bharat-docs
              </TypingAnimation>
              <AnimatedSpan>   Initializing system……</AnimatedSpan>
              <AnimatedSpan>   Docs loaded ✓</AnimatedSpan>
              <AnimatedSpan>   visit /docs</AnimatedSpan>
              <AnimatedSpan>   Notes indexed ✓</AnimatedSpan>
              <AnimatedSpan>   visit /notes</AnimatedSpan>
              <TypingAnimation className="text-emerald-400 font-mono">
                $ Explore it
              </TypingAnimation>
            </Terminal>
          </div>
        </div>
      </div>
    </section>
  );
}
