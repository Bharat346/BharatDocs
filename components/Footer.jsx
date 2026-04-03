"use client";

import Link from "next/link";
import { useThemeContext } from "@/components/ThemeProvider";
import { Github, Globe, Linkedin } from "lucide-react";

export default function Footer() {
  const { theme } = useThemeContext();
  const isDark = theme === "dark";

  return (
    <footer
      className={`py-16 px-6 mt-20 border-t ${isDark ? "bg-black border-white/5" : "bg-white border-neutral-100"}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div
              className={`text-2xl font-black uppercase tracking-tighter mb-4 ${isDark ? "text-white" : "text-black"}`}
            >
              BHARAT<span className="text-indigo-500">DOCS</span>
            </div>
            <p
              className={`max-w-sm text-sm leading-relaxed ${isDark ? "text-neutral-500" : "text-neutral-500"}`}
            >
              A premium, fast, and secure document management platform built for
              speed and precision. Manage your notes, documents, and research
              all in one place.
            </p>
          </div>

          <div>
            <h4
              className={`text-xs font-bold uppercase tracking-widest mb-6 ${isDark ? "text-neutral-400" : "text-neutral-900"}`}
            >
              Navigation
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/"
                  className={`text-sm ${isDark ? "text-neutral-500 hover:text-indigo-400" : "text-neutral-500 hover:text-indigo-600"} transition-colors`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className={`text-sm ${isDark ? "text-neutral-500 hover:text-indigo-400" : "text-neutral-500 hover:text-indigo-600"} transition-colors`}
                >
                  Documents
                </Link>
              </li>
              <li>
                <Link
                  href="/notes"
                  className={`text-sm ${isDark ? "text-neutral-500 hover:text-indigo-400" : "text-neutral-500 hover:text-indigo-600"} transition-colors`}
                >
                  Notes
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap-graph"
                  className={`text-sm ${isDark ? "text-neutral-500 hover:text-indigo-400" : "text-neutral-500 hover:text-indigo-600"} transition-colors`}
                >
                  Visual Sitemap
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className={`text-xs font-bold uppercase tracking-widest mb-6 ${isDark ? "text-neutral-400" : "text-neutral-900"}`}
            >
              Connect
            </h4>
            <div className="flex gap-4">
              <a
                href="https://github.com/Bharat346/BharatDocs"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-all ${isDark ? "bg-neutral-900 text-neutral-400 hover:text-white" : "bg-neutral-50 text-neutral-500 hover:text-black"}`}
                title="GitHub Repository"
              >
                <Github size={18} />
              </a>
              <a
                href="https://www.linkedin.com/in/bharat346/"
                className={`p-2 rounded-lg transition-all ${isDark ? "bg-neutral-900 text-neutral-400 hover:text-white" : "bg-neutral-50 text-neutral-500 hover:text-black"}`}
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://portfolio.bhdocs.in"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-all ${
                  isDark
                    ? "bg-neutral-900 text-neutral-400 hover:text-white"
                    : "bg-neutral-50 text-neutral-500 hover:text-black"
                }`}
                title="Portfolio"
              >
                <Globe size={18} />
              </a>
            </div>
          </div>
        </div>

        <div
          className={`pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${isDark ? "border-white/5" : "border-neutral-100"}`}
        >
          <div
            className={`text-xs font-medium ${isDark ? "text-neutral-600" : "text-neutral-400"}`}
          >
            &copy; {new Date().getFullYear()} Bharat Kumar. All rights reserved.
          </div>
          <div
            className={`flex items-center gap-2 text-xs font-medium ${isDark ? "text-neutral-600" : "text-neutral-400"}`}
          >
            Stay focused &bull; Keep learning
          </div>
        </div>
      </div>
    </footer>
  );
}
