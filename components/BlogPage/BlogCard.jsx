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
      layout="position"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05, 
        ease: [0.23, 1, 0.32, 1] 
      }}
      className="h-full"
    >
      <Link
        href={`/blogs/${blog.slug}`}
        className="group relative flex flex-col h-full bg-secondary-bg dark:bg-zinc-900 border border-border/50 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-[0_20px_50px_-20px_rgba(59,130,246,0.15)]"
      >
        {/* Cover Image Area */}
        <div className="relative h-56 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {coverImage ? (
            <img
              src={coverImage}
              alt={blog.title}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20">
              <span className="text-6xl font-black text-primary/10 select-none">{blog.title.charAt(0)}</span>
            </div>
          )}
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {blog.isFeatured && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {blog.tags?.slice(0, 1).map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-wider rounded-lg">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 flex flex-col flex-1 relative">
          <div className="flex items-center gap-2 mb-3">
             <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
               <Calendar className="w-3 h-3" />
               {formattedDate}
             </div>
             <span className="w-1 h-1 rounded-full bg-border" />
             <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
               <Clock className="w-3 h-3" />
               {blog.readTime} min
             </div>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-3 leading-tight">
            {blog.title}
          </h3>

          <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-6 leading-relaxed opacity-90">
            {blog.description}
          </p>

          <div className="mt-auto pt-5 flex items-center justify-between border-t border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-black overflow-hidden relative group-hover:border-primary/50 transition-colors">
                 {blog.author?.charAt(0) || "B"}
                 <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-wider text-foreground/80">{blog.author || "BharatDocs"}</span>
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">Chief Architect</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              Read More
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
