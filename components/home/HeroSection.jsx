"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

/* ── Custom SVG Icons for Cards ── */
const DocsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[var(--primary)]">
    <path d="M7 18H17V16H7V18Z" fill="currentColor" opacity="0.3" />
    <path d="M7 14H13V12H7V14Z" fill="currentColor" opacity="0.3" />
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 11L7 13L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 11L15 13L13 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NotesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[var(--accent)]">
    <path d="M4 19.5C4 18.837 4.53726 18.3 5.2 18.3H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M4 21.5V2.5C4 2.22386 4.22386 2 4.5 2H18C18.5523 2 19 2.44772 19 3V21M4 21.5C4 22.3284 4.67157 23 5.5 23H19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 7H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    <path d="M8 11H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    <path d="M12 15L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BlogsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#8b5cf6]">
    <path d="M19 22H5C3.34315 22 2 20.6569 2 19V5C2 3.34315 3.34315 2 5 2H19C20.6569 2 22 3.34315 22 5V19C22 20.6569 20.6569 22 19 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 6H18V10H6V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" opacity="0.1" />
    <path d="M6 14H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    <path d="M6 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    <circle cx="15.5" cy="14.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="19.5" cy="14.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M17 14.5H18" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default function HeroSection() {
  const [text, setText] = useState("");
  const fullText = "Learn. Build. Share.";

  // Typing effect
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setText(fullText.substring(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden pt-20">
      {/* ── Electron & Spherical Wavefronts ── */}
      <div className="absolute inset-0 z-0 hidden md:flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="relative flex items-center justify-center">
          {/* Central Electron */}
          <div className="absolute w-64 h-64 z-10 opacity-[0.05] pointer-events-none" style={{ transform: 'translateZ(0)' }}>
            <Image src="/electron.svg" alt="Electron Field" fill className="object-contain" priority />
          </div>

          {/* Emitted Wavefronts */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border border-[var(--primary)] animate-wavefront opacity-0"
              style={{
                width: '150vw',
                height: '150vw',
                maxWidth: '1200px',
                maxHeight: '1200px',
                animationDelay: `${i * 1.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center pb-20">

        {/* Terminal Tagline */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--primary)] text-sm font-mono mb-8 hover:border-[var(--primary)] transition-colors cursor-default shadow-sm animate-fade-in-up"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
          </span>
          ~/{text}
        </div>

        <h1
          className="text-6xl md:text-8xl font-black tracking-tighter text-[var(--fg)] mb-6 leading-tight animate-fade-in-up delay-100 opacity-0 [animation-fill-mode:forwards]"
        >
          Knowledge, <br className="md:hidden" />
          <span className="text-[var(--primary)]">
            Elevated.
          </span>
        </h1>

        <p
          className="max-w-2xl text-lg md:text-xl text-[var(--fg-secondary)] font-medium mb-16 leading-relaxed animate-fade-in-up delay-200 opacity-0 [animation-fill-mode:forwards]"
        >
          The ultimate centralized hub for pristine developer documentation, structured study notes, and elite technical articles.
        </p>

        {/* ── Quick Access Cards ── */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl relative animate-fade-in-up delay-300 opacity-0 [animation-fill-mode:forwards]"
        >

          {[
            {
              title: "Documentation",
              desc: "Guides and references",
              href: "/docs",
              Icon: DocsIcon,
              color: "group-hover:border-[var(--primary)]",
              iconBg: "bg-[var(--primary-ghost)] text-[var(--primary)]"
            },
            {
              title: "Study Notes",
              desc: "Curated PDFs and materials",
              href: "/notes",
              Icon: NotesIcon,
              color: "group-hover:border-[var(--accent)]",
              iconBg: "bg-[var(--accent-ghost)] text-[var(--accent)]"
            },
            {
              title: "Technical Blog",
              desc: "Articles and insights",
              href: "/blogs",
              Icon: BlogsIcon,
              color: "group-hover:border-[#8b5cf6]",
              iconBg: "bg-[#8b5cf6]/8 text-[#8b5cf6]"
            },
          ].map((card) => (
            <Link key={card.title} href={card.href} className={`group flex flex-col p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${card.color}`}>
              <div className={`p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 ${card.iconBg}`}>
                <card.Icon />
              </div>
              <h3 className="text-xl font-bold text-[var(--fg)] mb-2 flex items-center justify-between">
                {card.title}
                <ChevronRight className="w-5 h-5 text-[var(--fg-muted)] group-hover:text-[var(--primary)] transform group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-[var(--fg-secondary)] leading-relaxed">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
