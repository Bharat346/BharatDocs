"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Terminal,
  TypingAnimation,
  AnimatedSpan,
} from "@/components/ui/terminal";
import {
  ArrowRight,
  BookOpen,
  Notebook,
  FileText,
  Folder,
  FileCode,
  FileJson,
  FileArchive,
  Cpu,
  Database,
  Shield,
  Zap,
  Cloud,
  Lock,
  Search,
  Globe,
  Server,
  Code,
  Terminal as TerminalIcon,
  GitBranch,
  Cpu as CpuIcon,
  Database as DatabaseIcon,
  Shield as ShieldIcon,
} from "lucide-react";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

export default function HeroSection({ theme }) {
  const isDark = theme === "dark";
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const particlesRef = useRef(null);

  const techIcons = [
    { icon: Cpu, color: "text-purple-400", delay: 0 },
    { icon: Database, color: "text-emerald-400", delay: 0.1 },
  ];

  const floatingIcons = [
    { icon: FileText, x: "10%", y: "20%", delay: 0, size: 24, path: "circle" },
    { icon: Folder, x: "85%", y: "15%", delay: 0.2, size: 28, path: "sine" },
    {
      icon: FileCode,
      x: "15%",
      y: "85%",
      delay: 0.4,
      size: 22,
      path: "triangle",
    },
    {
      icon: FileJson,
      x: "90%",
      y: "75%",
      delay: 0.6,
      size: 26,
      path: "circle",
    },
    {
      icon: FileArchive,
      x: "5%",
      y: "50%",
      delay: 0.8,
      size: 20,
      path: "sine",
    },
    {
      icon: TerminalIcon,
      x: "80%",
      y: "40%",
      delay: 1,
      size: 24,
      path: "triangle",
    },
    {
      icon: GitBranch,
      x: "20%",
      y: "30%",
      delay: 1.2,
      size: 28,
      path: "circle",
    },
    { icon: CpuIcon, x: "75%", y: "90%", delay: 1.4, size: 22, path: "sine" },
    {
      icon: DatabaseIcon,
      x: "40%",
      y: "10%",
      delay: 1.6,
      size: 26,
      path: "triangle",
    },
    {
      icon: ShieldIcon,
      x: "60%",
      y: "85%",
      delay: 1.8,
      size: 24,
      path: "circle",
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 100, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.5,
          ease: "power4.out",
          delay: 0.3,
        },
      );
      // Subtitle animation
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", delay: 0.8 },
      );
      // Buttons animation
      gsap.fromTo(
        buttonsRef.current?.children,
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
          stagger: 0.2,
          delay: 1.2,
        },
      );

      // Floating icons
      floatingIcons.forEach((icon, i) => {
        const el = document.querySelector(`.floating-icon-${i}`);
        if (!el) return;

        let pathValues;
        switch (icon.path) {
          case "circle":
            pathValues = [
              { x: 0, y: 0 },
              { x: 30, y: -40 },
              { x: 60, y: 0 },
              { x: 30, y: 40 },
              { x: 0, y: 0 },
            ];
            break;
          case "sine":
            pathValues = [
              { x: 0, y: 0 },
              { x: 40, y: -30 },
              { x: 80, y: 0 },
              { x: 120, y: 30 },
              { x: 160, y: 0 },
            ];
            break;
          case "triangle":
            pathValues = [
              { x: 0, y: 0 },
              { x: 50, y: -50 },
              { x: 100, y: 0 },
              { x: 50, y: 50 },
              { x: 0, y: 0 },
            ];
            break;
        }

        gsap.to(el, {
          motionPath: { values: pathValues, curviness: 1 },
          duration: 15 + Math.random() * 10,
          repeat: -1,
          ease: "none",
          delay: icon.delay * 2,
        });
        gsap.to(el, {
          rotation: 360,
          duration: 20 + Math.random() * 10,
          repeat: -1,
          ease: "none",
          delay: icon.delay,
        });
      });

      // Tech icons floating
      techIcons.forEach((icon, i) => {
        const el = document.querySelector(`.tech-icon-${i}`);
        if (!el) return;
        gsap.to(el, {
          y: -20,
          duration: 2 + Math.random(),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: icon.delay,
        });
        gsap.to(el, {
          opacity: 0.7,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          delay: icon.delay * 1.5,
        });
      });

      // Particle animation
      if (particlesRef.current) {
        const particles = particlesRef.current.querySelectorAll(".particle");
        particles.forEach((p, i) => {
          gsap.to(p, {
            x: `+=${Math.random() * 200 - 100}`,
            y: `+=${Math.random() * 200 - 100}`,
            duration: 3 + Math.random() * 4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.1,
          });
        });
      }

      // Scroll-trigger
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          gsap.to(".terminal-wrapper", {
            y: self.progress * 100,
            rotation: self.progress * 2,
            duration: 0.1,
          });
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className={`relative min-h-screen overflow-hidden ${isDark ? "bg-gray-900" : "bg-white"}`}
    >
      {/* Particles */}
      <div ref={particlesRef} className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              backgroundColor: isDark
                ? `rgba(59,130,246,${Math.random() * 0.3 + 0.1})`
                : `rgba(37,99,235,${Math.random() * 0.2 + 0.05})`,
            }}
          />
        ))}
      </div>

      {/* Floating tech icons */}
      <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 opacity-10">
        {techIcons.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={`tech-icon-${i} flex items-center justify-center`}
            >
              <Icon size={40} className={item.color} />
            </div>
          );
        })}
      </div>

      {/* Floating icons */}
      {floatingIcons.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={i}
            className={`floating-icon-${i} absolute pointer-events-none`}
            style={{ left: item.x, top: item.y }}
          >
            <div className="relative">
              <Icon
                size={item.size}
                className={`${isDark ? "text-blue-400/40" : "text-blue-600/30"} drop-shadow-lg`}
              />
              <div
                className="absolute inset-0 blur-md"
                style={{
                  background: isDark
                    ? "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)"
                    : "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)",
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl w-full grid lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-24 items-center pb-4">
          {/* Text content - Left Column */}
          <div className="flex flex-col justify-center text-center lg:text-left space-y-8 lg:space-y-10">
            <div ref={titleRef} className="space-y-4">
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-mono ${isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-600"}`}
                >
                  v-2.0
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-mono ${isDark ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-600"}`}
                >
                  Secure
                </span>
              </div>
              <h1
                className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-mono leading-[0.9] tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
              >
                <span
                  className={`relative inline-block ${isDark ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400" : "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600"}`}
                >
                  Bharat
                </span>{" "}
                <span className="relative">
                  Docs
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                </span>
              </h1>
            </div>

            <p
              ref={subtitleRef}
              className={`text-lg font-mono sm:text-xl lg:text-2xl max-w-2xl mx-auto lg:mx-0 leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}
            >
              Enterprise-grade platform for organizing, searching, and
              collaborating on documents with intelligent AI assistance. Trusted
              by research institutions, legal firms, and academic organizations
              worldwide.
            </p>

            <div
              ref={buttonsRef}
              className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start"
            >
              <Link href="/docs" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="group h-16 px-10 w-full sm:w-auto rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.03] transition-all duration-300 overflow-hidden relative"
                >
                  <span className="absolute inset-0 translate-x-full group-hover:translate-x-0 transition-transform duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <BookOpen className="w-5 h-5 mr-2" />
                  <span className="relative font-mono">Explore Docs</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link href="/notes" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className={`group h-16 px-10 w-full sm:w-auto rounded-2xl border-2 relative overflow-hidden ${isDark ? "border-white/20 text-white bg-white/5 hover:bg-white/10" : "border-gray-300 text-gray-800 hover:bg-gray-100"} hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300`}
                >
                  <span className="absolute inset-0 border-2 border-emerald-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Notebook className="w-5 h-5 mr-2" />
                  <span className="relative font-mono">Visit Notes</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Terminal - Right Column */}
          <div className="terminal-wrapper flex justify-center lg:justify-end">
            <Terminal
              className={`max-w-lg w-full ${isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}
            >
              <TypingAnimation className="text-emerald-500 font-mono">
                $$ welcome to bharat - docs
              </TypingAnimation>
              <AnimatedSpan> ███▒▒▒▒▒▒▒ 30% LOADING</AnimatedSpan>
              <AnimatedSpan> ██████████ 100% READY</AnimatedSpan>
              <AnimatedSpan> Initializing ...</AnimatedSpan>

              <TypingAnimation className="text-emerald-500 font-mono">
                $$ npm help
              </TypingAnimation>
              <AnimatedSpan> # Documentation available at /docs</AnimatedSpan>
              <AnimatedSpan> # Notes available at /notes</AnimatedSpan>
              <AnimatedSpan> # Performance: Optimal</AnimatedSpan>
              <TypingAnimation>
                Success! Project initialization completed.
              </TypingAnimation>
            </Terminal>
          </div>
        </div>
      </div>
    </section>
  );
}