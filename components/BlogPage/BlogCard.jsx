"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Tag, Star, User } from "lucide-react";

export default function BlogCard({ blog, index = 0 }) {
  const formattedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Draft";

  // Use image proxy for external images
  const coverImage = blog.coverImage 
    ? (blog.coverImage.startsWith('http') ? `/api/image-proxy?url=${encodeURIComponent(blog.coverImage)}` : blog.coverImage)
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        href={`/blogs/${blog.slug}`}
        className="group flex flex-col h-full bg-background border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:border-blue-500 transition-colors"
      >
        {/* Cover Image */}
        <div className="relative h-52 bg-neutral-100 dark:bg-neutral-800/50 overflow-hidden">
          {coverImage ? (
            <img
              src={coverImage}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl font-black text-neutral-300 dark:text-neutral-700 select-none">
              {blog.title.charAt(0)}
            </div>
          )}
          {blog.isFeatured && (
            <div className="absolute top-4 left-4 px-2.5 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-md shadow-lg">
              Featured
            </div>
          )}
          {blog.readTime && (
            <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold rounded-md">
              {blog.readTime} min read
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] bg-secondary-bg border border-border text-neutral-500 dark:text-neutral-400 rounded-md group-hover:border-indigo-500/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3 className="text-xl font-black tracking-tight leading-[1.1] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-3">
            {blog.title}
          </h3>

          <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-6 leading-relaxed">
            {blog.description}
          </p>

          <div className="mt-auto pt-6 flex items-center justify-between border-t border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600 text-xs font-bold uppercase">
                {blog.author?.charAt(0) || "A"}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider text-foreground">
                  {blog.author}
                </span>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                  {formattedDate}
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
