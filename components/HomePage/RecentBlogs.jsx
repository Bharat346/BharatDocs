"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Newspaper } from "lucide-react";

export default function RecentBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blogs?limit=3")
      .then((r) => r.json())
      .then((data) => {
        if (data.blogs) setBlogs(data.blogs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || blogs.length === 0) return null;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[2px] bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                Fresh Updates
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95] text-foreground">
              Recently <span className="text-primary">Published</span>
            </h2>
          </div>
          <Link
            href="/blogs"
            className="hidden sm:flex items-center gap-2 text-sm font-bold text-primary hover:underline group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Blog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((blog, i) => {
            const coverImage = blog.coverImage
              ? blog.coverImage.startsWith("http")
                ? `/api/image-proxy?url=${encodeURIComponent(blog.coverImage)}`
                : blog.coverImage
              : null;

            return (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/blogs/${blog.slug}`}
                  className="group block h-full bg-secondary-bg border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                >
                  {coverImage ? (
                    <div className="h-40 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src={coverImage}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-rose-500/10 via-indigo-500/10 to-blue-500/10 flex items-center justify-center">
                      <span className="text-5xl font-black text-primary/10 select-none">
                        {blog.title.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="p-5">
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex gap-1.5 mb-2">
                        {blog.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
                      {blog.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {blog.publishedAt
                          ? new Date(blog.publishedAt).toLocaleDateString(
                              "en-IN",
                              { month: "short", day: "numeric" },
                            )
                          : "Draft"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {blog.readTime || 5} min
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile "View All" */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary"
          >
            View All Articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
