"use client";

import PdfUploader from "@/components/admin/PdfUploader";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminUploaderPage() {
  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-blue-500 transition-colors group mb-4"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold mb-2">PDF Asset Management</h1>
          <p className="text-neutral-500 mb-8">
            Upload and manage your lecture notes with Vercel Blob.
          </p>
          <PdfUploader />
        </motion.div>
      </div>
    </div>
  );
}
