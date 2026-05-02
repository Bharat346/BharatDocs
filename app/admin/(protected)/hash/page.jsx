"use client";

import { useState } from "react";
import BharatLoader from "@/components/ui/loader";
import { Key, Copy, Check, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GenerateHashPage() {
  const [password, setPassword] = useState("");
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!password) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/generate-hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.hash) {
        setHash(data.hash);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-sm"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-600 rounded-xl">
            <Key className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 uppercase tracking-wider">
              Generate Admin Hash
            </h1>
            <p className="text-sm text-neutral-500 font-medium">
              Create a secure PBKDF2 hash for the `admins` table
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] text-neutral-500 mb-2 block uppercase tracking-widest font-black">
              Raw Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500 transition-all font-mono"
              placeholder="••••••••••••"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!password || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-400 dark:disabled:text-neutral-500 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg active:scale-95"
          >
            {loading ? (
              <BharatLoader small text="" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            {loading ? "Generating..." : "Generate Hash"}
          </button>

          <AnimatePresence>
            {hash && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-8 p-6 bg-white dark:bg-black/50 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Generated Hash Result
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold text-neutral-500"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? "Copied!" : "Copy Hash"}
                  </button>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 break-all font-mono text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                  {hash}
                </div>
                <p className="mt-4 text-[10px] text-neutral-400 italic">
                  Note: Paste this value into the `passwordHash` column of your
                  `admins` table.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
