"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { QUERY_CACHE } from "@/components/providers/QueryProvider";
import BlogCard from "@/components/blogs/BlogCard";

export default function RecentBlogs({ initialBlogs = null }) {
  const { data, isLoading } = useQuery({
    queryKey: ["recent-blogs"],
    queryFn: () => fetch("/api/blogs?limit=3").then((r) => r.json()),
    initialData: initialBlogs ? { blogs: initialBlogs } : undefined,
    ...QUERY_CACHE.listings,
  });

  const blogs = data?.blogs || [];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-[var(--fg)] mb-3">
            Latest Articles
          </h2>
          <p className="text-lg text-[var(--fg-secondary)]">
            Technical insights, tutorials, and thoughts.
          </p>
        </div>
        <Link 
          href="/blogs" 
          className="inline-flex items-center gap-2 text-sm font-bold text-[#8b5cf6] hover:opacity-80 transition-opacity group"
        >
          Read the blog
          <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="aspect-[16/9] skeleton rounded-2xl" />
              <div className="h-6 skeleton w-3/4" />
              <div className="h-4 skeleton w-full" />
            </div>
          ))}
        </div>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map((blog, index) => (
            <BlogCard 
              key={blog.id} 
              blog={{...blog, isFeatured: index === 0}} 
              index={index} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-2xl">
          <p className="text-[var(--fg-muted)]">No published blogs found.</p>
        </div>
      )}
    </section>
  );
}
