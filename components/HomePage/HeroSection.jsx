"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Notebook } from "lucide-react";
import CTASection from "./CTASection";

import { shouldPrefetch } from "@/lib/network/network.config";

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
  }, []);

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
    <>
      <section
        ref={containerRef}
        className={`relative min-h-screen flex items-center justify-center overflow-hidden ${
          isDark ? "bg-neutral-950" : "bg-white"
        }`}
      >
        {/* Background Grid */}
        <div
          className={`absolute inset-0 pointer-events-none ${
            isDark ? "opacity-[0.15]" : "opacity-[0.25]"
          }`}
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            color: isDark ? "#38bdf8" : "#2563eb",
          }}
        />

        {/* Floating Particles */}
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

        {/* CONTENT WRAPPER */}
        <div className="relative z-10 w-full max-w-6xl px-6 text-center">
          {/* Badge */}
          <div
            ref={subtitleRef}
            className={`inline-block mb-6 px-4 py-1.5 rounded-full border text-sm font-mono ${
              isDark
                ? "border-sky-400/30 text-sky-400"
                : "border-indigo-400/40 text-indigo-600"
            }`}
          >
            Built for focused learning
          </div>

          {/* Title */}
          <div ref={titleRef}>
            <h1
              className={`font-mono text-5xl sm:text-6xl md:text-7xl xl:text-8xl tracking-tight leading-tight ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Bharat Docs
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className={`mt-8 max-w-3xl mx-auto text-lg sm:text-xl leading-relaxed font-mono ${
              isDark ? "text-neutral-300" : "text-neutral-600"
            }`}
          >
            A performance-first documentation and knowledge system designed for
            clarity, structure, and long-term retention. Minimal interface.
            Maximum cognitive focus.
          </p>

          {/* Feature Pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm font-mono">
            <span className="px-4 py-2 rounded-full border border-sky-400/30 text-sky-400">
              ⚡ Ultra Fast
            </span>
            <span className="px-4 py-2 rounded-full border border-indigo-400/30 text-indigo-400">
              📚 Structured Notes
            </span>
            <span className="px-4 py-2 rounded-full border border-purple-400/30 text-purple-400">
              🎯 Focus Optimized
            </span>
          </div>

          {/* Buttons */}
          <div
            ref={buttonsRef}
            className="mt-12 flex flex-col sm:flex-row gap-5 justify-center"
          >
            <Link href="/docs" prefetch={shouldPrefetch()}>
              <Button
                size="lg"
                className="h-14 min-w-44 px-10 rounded-2xl border-2 border-sky-400 text-sky-400 bg-transparent
                       hover:bg-sky-400 hover:text-neutral-900 transition-all duration-300"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Docs
              </Button>
            </Link>

            <Link href="/notes" prefetch={shouldPrefetch()}>
              <Button
                size="lg"
                className="h-14 min-w-44 px-10 rounded-2xl border-2 border-indigo-400 text-indigo-400 bg-transparent
                       hover:bg-indigo-400 hover:text-neutral-900 transition-all duration-300"
              >
                <Notebook className="mr-2 h-5 w-5" />
                Visit Notes
              </Button>
            </Link>
          </div>

          {/* Micro credibility section */}
          <div
            className={`mt-16 text-sm font-mono ${
              isDark ? "text-neutral-500" : "text-neutral-400"
            }`}
          >
            Designed for deep work • No distractions • Optimized for slow
            networks
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
}
