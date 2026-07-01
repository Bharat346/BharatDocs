"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, FileText, Download, ExternalLink } from "lucide-react";
import { formatBytes } from "@/lib/utils/format";
import { motion } from "framer-motion";

export default function NoteCard({ note, index = 0 }) {
  const pathname = usePathname();
  const isFolder = note.type === "folder";
  const isPdf = note.fileType === "pdf";

  // For PDFs, we point to the GitHub content API which returns raw file or redirects to viewer
  const targetHref = isPdf 
    ? `/api/github/content?path=${encodeURIComponent(note.filePath)}` 
    : `${pathname === '/notes' ? '/notes' : pathname}/${note.slug}`;

  if (isFolder) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: "easeOut" }}
        whileHover={{ 
          y: -5, 
          scale: 1.02,
          rotateX: 2,
          rotateY: -2,
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.2)"
        }}
        className="perspective-1000 transform-style-3d h-full"
      >
        <Link
          href={targetHref}
          className="card p-5 group flex flex-col h-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl transition-colors"
        >
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-[var(--accent-ghost)] text-[var(--accent)]">
            <Folder className="w-6 h-6 fill-current opacity-20" />
          </div>
          {note.subFolderCount > 0 && (
            <span className="text-xs font-bold text-[var(--fg-muted)] bg-[var(--bg-tertiary)] px-2 py-1 rounded-full">
              {note.subFolderCount} {note.subFolderCount === 1 ? 'Folder' : 'Folders'}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors mb-2">
          {note.name}
        </h3>
        {note.description && (
          <p className="text-sm text-[var(--fg-secondary)] line-clamp-2 mt-auto">
            {note.description}
          </p>
        )}
        </Link>
      </motion.div>
    );
  }

  // Document/PDF Card
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: "easeOut" }}
      whileHover={{ 
        y: -5, 
        scale: 1.02,
        rotateX: 2,
        rotateY: -2,
        boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.2)"
      }}
      className="perspective-1000 transform-style-3d h-full"
    >
      <Link
        href={targetHref}
        target={isPdf ? "_blank" : undefined}
        className="card p-5 group flex flex-col h-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl transition-colors"
      >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${
          isPdf 
            ? "bg-red-500/10 text-red-500" 
            : "bg-[var(--primary-ghost)] text-[var(--primary)]"
        }`}>
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2">
          {isPdf && (
            <span className="text-[10px] font-mono uppercase bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded">
              PDF
            </span>
          )}
          {note.fileSize && (
            <span className="text-xs font-mono text-[var(--fg-muted)]">
              {formatBytes(note.fileSize)}
            </span>
          )}
        </div>
      </div>

      <h3 className="font-bold text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors mb-2 line-clamp-2">
        {note.name}
      </h3>
      
      {note.description && (
        <p className="text-sm text-[var(--fg-secondary)] line-clamp-2 mb-4">
          {note.description}
        </p>
      )}

      <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--fg-muted)]">
        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
        {isPdf ? (
          <span className="flex items-center gap-1 group-hover:text-[var(--primary)] transition-colors">
            Open <ExternalLink className="w-3 h-3" />
          </span>
        ) : (
          <span className="flex items-center gap-1 group-hover:text-[var(--primary)] transition-colors">
            Read <ChevronRight className="w-3 h-3" />
          </span>
        )}
        </div>
      </Link>
    </motion.div>
  );
}

function ChevronRight({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
