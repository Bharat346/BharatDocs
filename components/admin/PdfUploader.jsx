"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Check,
  Loader2,
  Copy,
  Folder,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PdfUploader() {
  const [file, setFile] = useState(null);
  const [folder, setFolder] = useState("notes");
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Suggestion states
  const [allFolders, setAllFolders] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await fetch("/api/admin/folders");
        const data = await res.json();
        if (data.folders) setAllFolders(data.folders);
      } catch (e) {
        console.error("Failed to fetch suggestion folders", e);
      }
    };
    fetchFolders();
  }, []);

  const handleFolderChange = (val) => {
    setFolder(val);

    // Suggestion logic
    const parts = val.split("/");
    const currentSegment = parts[parts.length - 1];

    let filtered = [];
    if (val.endsWith("/")) {
      // Look for children of the exact parent path
      const parent = val.slice(0, -1);
      filtered = allFolders
        .filter(
          (f) =>
            f.startsWith(parent + "/") && f.split("/").length === parts.length,
        )
        .map((f) => f.split("/").pop());
    } else {
      // Look for folders starting with the current segment in the current parent
      const prefix = parts.slice(0, -1).join("/");
      filtered = allFolders
        .filter((f) => {
          const fparts = f.split("/");
          const fparent = fparts.slice(0, -1).join("/");
          const fname = fparts[fparts.length - 1];
          return (
            (fparent === prefix || (!prefix && fparts.length === 1)) &&
            fname.toLowerCase().startsWith(currentSegment.toLowerCase())
          );
        })
        .map((f) => f.split("/").pop());
    }

    setSuggestions(Array.from(new Set(filtered)).slice(0, 5));
    setShowSuggestions(filtered.length > 0);
  };

  const applySuggestion = (s) => {
    const parts = folder.split("/");
    parts[parts.length - 1] = s;
    const newPath = parts.join("/") + "/";
    setFolder(newPath);
    setShowSuggestions(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      // Use arrayBuffer for the file to pass to the API
      const response = await fetch(
        `/api/admin/upload-pdf?filename=${encodeURIComponent(file.name)}&folder=${encodeURIComponent(folder)}`,
        {
          method: "POST",
          body: file,
        },
      );

      const newBlob = await response.json();
      if (newBlob.url) {
        setUrl(newBlob.url);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const fullPathPreview = file
    ? `${folder.replace(/\/+$/, "")}/${file.name}`
    : `(Select a file to see full path)`;

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
        <Upload className="w-5 h-5 text-blue-500" />
        Upload Notes PDF
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="text-[10px] text-neutral-500 mb-2 block uppercase tracking-wider font-black">
              Target Folder (Vercel Blob)
            </label>
            <div className="relative group">
              <input
                type="text"
                value={folder}
                onChange={(e) => handleFolderChange(e.target.value)}
                onFocus={() => folder && handleFolderChange(folder)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 text-sm text-neutral-800 dark:text-neutral-300 focus:outline-none focus:border-blue-500 transition-colors shadow-inner pr-10"
                placeholder="e.g. notes, Btech/CSE/sem1"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 group-hover:text-blue-500 transition-colors pointer-events-none">
                <Folder className="w-4 h-4" />
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-[calc(100%+4px)] left-0 w-full z-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden"
                  >
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseDown={() => applySuggestion(s)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 transition-colors border-b border-neutral-100 dark:border-neutral-800 last:border-none group/item"
                      >
                        <div className="p-1 bg-neutral-100 dark:bg-neutral-800 rounded group-hover/item:bg-blue-500/10 transition-colors">
                          <Folder className="w-3 h-3 text-neutral-400 group-hover/item:text-blue-500" />
                        </div>
                        <span className="flex-1 font-medium">{s}</span>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest opacity-0 group-hover/item:opacity-100 transition-opacity">
                          Select
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-neutral-500 mb-2 block uppercase tracking-wider font-black">
              Path Preview
            </label>
            <div className="w-full bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 text-sm text-neutral-400 dark:text-neutral-500 truncate font-mono italic flex items-center gap-2">
              <ChevronRight className="w-3 h-3 text-neutral-400 flex-shrink-0" />
              {fullPathPreview}
            </div>
          </div>
        </div>

        <div
          className="border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 transition-colors cursor-pointer relative bg-white dark:bg-transparent"
          onClick={() => document.getElementById("pdf-input").click()}
        >
          <input
            id="pdf-input"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <FileText
            className={`w-12 h-12 ${file ? "text-green-500" : "text-neutral-300 dark:text-neutral-600"}`}
          />
          <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
            {file ? file.name : "Click to select a PDF file"}
          </p>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-400 dark:disabled:text-neutral-500 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          {uploading ? "Uploading to Vercel..." : "Upload to Blob"}
        </button>

        {url && (
          <div className="mt-4 p-4 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl">
            <label className="text-[10px] text-neutral-500 mb-2 block uppercase tracking-wider font-black">
              Generated URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={url}
                className="bg-transparent border-none text-sm text-blue-500 dark:text-blue-400 w-full focus:ring-0 truncate"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                {isCopied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
