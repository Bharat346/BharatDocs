"use client";

import Link from "next/link";
import { useThemeContext } from "@/components/ThemeProvider";
import { Github, Globe, Linkedin } from "lucide-react";

export default function Footer() {
  const { theme } = useThemeContext();
  const isDark = theme === "dark";

  return (
    <footer className="py-20 px-6 mt-20 border-t border-border bg-background transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-black uppercase tracking-tighter mb-6 text-foreground">
              BHARAT<span className="text-primary">DOCS</span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 font-medium italic">
              "A learning hub for all, where a person with their own resolution can gain and growth. Question is 'What I learn today?'. Where to start study? Try BharatDocs!!"
            </p>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-foreground/80">
              Navigation
            </h4>
            <ul className="space-y-4">
              {[
                { label: "Home", href: "/" },
                { label: "Documents", href: "/docs" },
                { label: "Notes", href: "/notes" },
                { label: "Visual Sitemap", href: "/sitemap-graph" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-neutral-500 hover:text-primary transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-foreground/80">
              Connect
            </h4>
            <div className="flex gap-3">
              {[
                { 
                  icon: <Github size={20} />, 
                  href: "https://github.com/Bharat346/BharatDocs",
                  title: "GitHub"
                },
                { 
                  icon: <Linkedin size={20} />, 
                  href: "https://www.linkedin.com/in/bharat346/",
                  title: "LinkedIn"
                },
                { 
                  icon: <Globe size={20} />, 
                  href: "https://portfolio.bhdocs.in",
                  title: "Portfolio"
                },
              ].map((social) => (
                <a
                  key={social.title}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-secondary-bg border border-border text-neutral-500 hover:text-primary hover:border-primary/30 transition-all duration-300 shadow-sm active:scale-95"
                  title={social.title}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-neutral-500 italic opacity-60">
            &copy; {new Date().getFullYear()} Bharat Kumar &bull; All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-neutral-500 italic opacity-60">
            <span>Intelligence Redefined</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Stay Focused</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
