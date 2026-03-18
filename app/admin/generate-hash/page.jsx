"use client";

import { useState } from "react";
import { Copy, Check, Shield } from "lucide-react";

export default function GenerateHashPage() {
  const [password, setPassword] = useState("");
  const [hash, setHash] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!password) return;
    setIsLoading(true);
    try {
      const resp = await fetch("/api/admin/generate-hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await resp.json();
      if (data.hash) {
        setHash(data.hash);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-blue-500" />
          <h1 className="text-2xl font-bold">Admin Hash Generator</h1>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !password}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900/50 py-3 rounded-lg font-semibold transition-colors"
          >
            {isLoading ? "Generating..." : "Generate Hash"}
          </button>

          {hash && (
            <div className="mt-6">
              <label className="block text-sm text-neutral-400 mb-1">
                Generated Hash
              </label>
              <div className="w-full bg-black border border-neutral-800 rounded-lg p-3 flex items-center justify-between gap-2 overflow-hidden">
                <code className="text-xs break-all text-neutral-300 font-mono flex-1">
                  {hash}
                </code>
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors shrink-0"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-neutral-500 mt-2 italic text-center">
                Copy this hash and add it to the 'admins' table in your
                database.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
