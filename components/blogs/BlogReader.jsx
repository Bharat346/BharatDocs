"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Calendar, Clock, ChevronLeft, Github } from "lucide-react";
import Link from "next/link";
import TagBadge from "@/components/shared/TagBadge";
import ShareButtons from "@/components/shared/ShareButtons";

export default function BlogReader({ blog, content, headings }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <article className="min-h-screen bg-[var(--bg)] pb-24 relative">
      {/* ── Reading Progress Bar ── */}
      {mounted && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-[var(--primary)] z-[100] origin-left"
          style={{ scaleX }}
        />
      )}

      {/* ── Hero Section ── */}
      <header className="relative border-b border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
        {/* Parallax Cover Image */}
        {blog.coverImage && (
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={`/api/image-proxy?url=${encodeURIComponent(blog.coverImage)}`} 
              alt={blog.title}
              className="w-full h-full object-cover opacity-10"
            />
            {/* Fade out at the bottom using a mask so there's no harsh line */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] to-transparent" />
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 relative z-10">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--primary)] mb-8 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to blogs
          </Link>

          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-[var(--fg-muted)] mb-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(blog.publishedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {blog.readTime} min read
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[var(--fg)] mb-6 leading-tight animate-fade-in-up">
            {blog.title}
          </h1>

          <p className="text-xl text-[var(--fg-secondary)] leading-relaxed mb-8 animate-fade-in-up delay-100">
            {blog.description}
          </p>

          <div className="flex items-center justify-between pt-8 border-t border-[var(--border)] animate-fade-in-up delay-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] p-[2px]">
                <div className="w-full h-full bg-[var(--bg-secondary)] rounded-full flex items-center justify-center font-bold text-[var(--fg)] text-sm">
                  {blog.author.charAt(0)}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--fg)]">{blog.author}</p>
                <p className="text-xs text-[var(--fg-muted)]">Author</p>
              </div>
            </div>

            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-end">
                {blog.tags.map(tag => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="prose prose-slate dark:prose-invert prose-lg max-w-none w-full mb-20 animate-fade-in-up delay-300">
          {content}
        </div>
        
        <ShareButtons title={blog.title} />

        {/* Footer */}
        <div className="border-t border-[var(--border)] pt-8 flex items-center justify-between text-sm">
          <p className="text-[var(--fg-muted)]">
            Published on {new Date(blog.publishedAt).toLocaleDateString()}
          </p>
        </div>
      </main>
    </article>
  );
}
