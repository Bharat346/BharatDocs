"use client";

import Link from "next/link";
import { Clock, Calendar, Newspaper, ArrowRight } from "lucide-react";
import FeatureTag from "@/components/shared/FeatureTag";
import TagBadge from "@/components/shared/TagBadge";

export default function BlogCard({ blog, featured = false, tags = [], index = 0 }) {
  return (
    <div className="h-full rounded-2xl p-5 bg-[var(--bg-secondary)] border border-[var(--border)] shadow-sm hover:border-[var(--border-hover)] hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <Link
        href={`/blogs/${blog.slug}`}
        className={`group flex flex-col gap-5 h-full ${featured ? 'md:flex-row md:items-center md:gap-12' : ''}`}
      >
        <div className={`
          relative rounded-xl overflow-hidden bg-[var(--bg-tertiary)] border border-[var(--border)]
          ${featured ? 'w-full md:w-3/5 aspect-[16/9]' : 'aspect-[16/9]'}
        `}>
          {/* Featured Badge */}
          {(blog.isFeatured || featured) && (
            <div className="absolute top-4 left-4 z-20">
              <FeatureTag type="featured" />
            </div>
          )}
          {blog.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/image-proxy?url=${encodeURIComponent(blog.coverImage)}`}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--primary)] opacity-30 bg-[var(--bg-tertiary)]">
              <Newspaper className="w-16 h-16" />
            </div>
          )}
        </div>

        <div className={`flex-1 flex flex-col justify-center ${featured ? 'py-4' : ''}`}>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[var(--fg-muted)] mb-4">
            <span className="flex items-center gap-1.5 bg-[var(--bg-tertiary)] px-2.5 py-1 rounded-full">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(blog.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5 bg-[var(--bg-tertiary)] px-2.5 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              {blog.readTime} min
            </span>
          </div>

          <h3 className={`font-black text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors mb-3 leading-tight ${featured ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'}`}>
            {blog.title}
          </h3>

          <p className={`text-[var(--fg-secondary)] line-clamp-2 leading-relaxed mb-6 ${featured ? 'text-lg' : 'text-sm'}`}>
            {blog.description}
          </p>

          <div className="mt-auto pt-5 border-t border-[var(--border)] flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {tags && tags.slice(0, 2).map(tag => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
              {tags && tags.length > 2 && (
                <span className="text-xs text-[var(--fg-muted)] font-medium px-2 py-1 bg-[var(--bg-tertiary)] rounded-full border border-[var(--border)]">
                  +{tags.length - 2}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[var(--primary)] text-sm font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              Read <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
