"use client";

import { Calendar, Clock, ArrowLeft, User, Tag } from "lucide-react";
import Link from "next/link";

export default function BlogHeader({ blog }) {
  const formattedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Draft";

  // Use image proxy for external images
  const coverImage = blog.coverImage 
    ? (blog.coverImage.startsWith('http') ? `/api/image-proxy?url=${encodeURIComponent(blog.coverImage)}` : blog.coverImage)
    : null;

  return (
    <header className="mb-14">
      <Link
        href="/blogs"
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-indigo-600 transition-colors mb-10"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Journal
      </Link>

      <div className="space-y-6">
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 text-xs font-black uppercase tracking-[0.1em] bg-neutral-200/80 dark:bg-secondary-bg/80 backdrop-blur-md border border-neutral-300/50 dark:border-border text-neutral-600 dark:text-neutral-300 rounded-lg shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.95] text-foreground uppercase">
            {blog.title}
          </h1>
          <p className="text-lg sm:text-xl text-neutral-500 dark:text-neutral-400 max-w-3xl leading-relaxed">
            {blog.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-8 pb-4 text-xs font-bold text-neutral-500 uppercase tracking-widest border-t border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600 text-[10px] font-black">
              {blog.author?.charAt(0) || "A"}
            </div>
            <span className="text-foreground">{blog.author}</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-border" />
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            {formattedDate}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-border" />
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            {blog.readTime || 5} min read
          </span>
        </div>
      </div>

      {coverImage && (
        <div className="mt-12 rounded-2xl overflow-hidden border border-border bg-secondary-bg shadow-2xl shadow-indigo-500/5">
          <img
            src={coverImage}
            alt={blog.title}
            className="w-full h-auto max-h-[600px] object-cover"
          />
        </div>
      )}
    </header>
  );
}
