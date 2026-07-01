"use client";

import { useState } from "react";
import BlogCard from "./BlogCard";
import { Newspaper, Search } from "lucide-react";

export default function BlogGrid({ initialData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const blogs = initialData?.blogs || [];

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (blog.description && blog.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Search Filter */}
      <div className="relative max-w-xl mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--fg-muted)]" />
        <input
          type="text"
          placeholder="Filter articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl py-3 pl-12 pr-4 text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
        />
      </div>

      {/* Main Feed */}
      <main className="w-full min-w-0">
        {filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-16">
            {filteredBlogs.map((blog, index) => (
              <BlogCard key={blog.id} blog={blog} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border border-dashed border-[var(--border)] rounded-2xl glass-subtle">
            <Newspaper className="w-12 h-12 mx-auto text-[var(--fg-muted)] mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-[var(--fg)] mb-2">No articles found</h3>
            <p className="text-sm text-[var(--fg-muted)]">
              Try searching for something else.
            </p>
          </div>
        )}
      </main>

    </div>
  );
}
