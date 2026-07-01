"use client";

import Link from "next/link";
import { Github, Linkedin, Globe } from "lucide-react";

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Docs", href: "/docs" },
  { label: "Notes", href: "/notes" },
  { label: "Blogs", href: "/blogs" },
];

const SOCIALS = [
  { icon: Github, href: "https://github.com/Bharat346/BharatDocs", title: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/bharat346/", title: "LinkedIn" },
  { icon: Globe, href: "https://portfolio.bhdocs.in", title: "Portfolio" },
];

export default function Footer() {
  return (
    <footer className="py-16 px-6 mt-20 border-t border-[var(--border)] bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="text-xl font-black uppercase tracking-tighter text-[var(--fg)] mb-4">
              BHARAT<span className="text-[var(--primary)]">DOCS</span>
            </div>
            <p className="text-sm leading-relaxed text-[var(--fg-muted)] max-w-xs">
              A modern learning hub for documentation, notes, and technical articles.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--fg-secondary)] mb-6">
              Navigation
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--fg-secondary)] mb-6">
              Connect
            </h4>
            <div className="flex gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.title}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-xl
                    bg-[var(--bg-secondary)] border border-[var(--border)]
                    text-[var(--fg-muted)] hover:text-[var(--primary)]
                    hover:border-[var(--border-hover)] transition-all active:scale-95"
                  title={social.title}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--border)] text-center">
          <p className="text-xs font-medium text-[var(--fg-muted)]">
            &copy; {new Date().getFullYear()} Bharat Kumar &bull; All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
