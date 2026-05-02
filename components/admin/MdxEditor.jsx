"use client";

import { useState, useEffect } from "react";
import BharatLoader from "@/components/ui/loader";
import { FileText, Save, Check, Folder, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useThemeContext } from "@/components/ThemeProvider";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MdxEditor() {
  const { mounted } = useThemeContext();

  const [content, setContent] = useState("");
  const [path, setPath] = useState("docs/");
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedUrl, setSavedUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [allFolders, setAllFolders] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await fetch("/api/admin/github-folders");
        const data = await res.json();
        if (data.folders) setAllFolders(data.folders);
      } catch (e) {
        console.error("Failed to fetch github suggestion folders", e);
      }
    };
    fetchFolders();
  }, []);
  
  if (!mounted) return null;

  const handlePathChange = (val) => {
    setPath(val);

    // Path Suggestion logic (similar to PdfUploader)
    const parts = val.split("/");
    const currentSegment = parts[parts.length - 1] || "";

    let filtered = [];
    if (val.endsWith("/")) {
      const parent = val.slice(0, -1);
      filtered = allFolders
        .filter(
          (f) =>
            f.startsWith(parent + "/") &&
            f.split("/").length === parts.length + 1,
        )
        .map((f) => f.split("/").pop());
    } else if (parts.length > 0) {
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
    const parts = path.split("/");
    if (path.endsWith("/")) {
      setPath(path + s + "/");
    } else {
      parts[parts.length - 1] = s;
      setPath(parts.join("/") + "/");
    }
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    if (!content || !path) return;
    setSaving(true);
    setSavedUrl("");
    try {
      const response = await fetch("/api/admin/save-to-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, path }),
      });

      const data = await response.json();
      if (data.success) {
        setIsSaved(true);
        if (data.result?.content?.html_url) {
          setSavedUrl(data.result.content.html_url);
        }
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      setSaving(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(savedUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          MDX Content Editor
        </h2>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs px-3 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
        >
          {showPreview ? "Switch to Edit" : "Preview MDX"}
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <label className="text-[10px] text-neutral-500 mb-2 block uppercase tracking-wider font-black">
            Relative path on GitHub
          </label>
          <div className="relative">
            <input
              type="text"
              value={path}
              onChange={(e) => handlePathChange(e.target.value)}
              onFocus={() => path && handlePathChange(path)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 text-sm text-neutral-800 dark:text-neutral-300 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner pr-10"
              placeholder="docs/category/topic.mdx"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 group-hover:text-indigo-500 transition-colors pointer-events-none">
              <Folder className="w-4 h-4" />
            </div>
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
                    <div className="p-1 bg-neutral-100 dark:bg-neutral-800 rounded group-hover/item:bg-indigo-500/10 transition-colors">
                      <Folder className="w-3 h-3 text-neutral-400 group-hover/item:text-indigo-500" />
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

        <div className="relative">
          {showPreview ? (
            <div className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 h-[400px] text-sm text-neutral-800 dark:text-neutral-300 overflow-y-auto prose dark:prose-invert prose-sm max-w-none shadow-inner">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || "_Start typing to see preview..._"}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 h-[400px] text-sm text-neutral-800 dark:text-neutral-300 font-mono focus:outline-none focus:border-indigo-500 transition-colors resize-none shadow-inner"
              placeholder="# Write your MDX content here..."
            />
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={!content || saving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-400 dark:disabled:text-neutral-500 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          {saving ? (
            <BharatLoader small text="" />
          ) : isSaved ? (
            <Check className="w-5 h-5 text-green-300" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving
            ? "Saving to GitHub..."
            : isSaved
              ? "Saved Successfully"
              : "Save as MDX"}
        </button>

        {savedUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-5 bg-white dark:bg-black border border-indigo-200 dark:border-indigo-900/30 rounded-2xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] text-indigo-500 dark:text-indigo-400 uppercase tracking-widest font-black flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                GitHub API Content URL
              </label>
              <div className="flex items-center gap-3">
                <a
                  href={savedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-neutral-400 hover:text-indigo-500 transition-colors flex items-center gap-1 font-bold underline decoration-dotted"
                >
                  Browser URL
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-indigo-600 dark:text-indigo-400 truncate font-mono">
                {`https://api.github.com/repos/Bharat346/docs-storage/contents/${path}`}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://api.github.com/repos/Bharat346/docs-storage/contents/${path}`,
                  );
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="p-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all group"
                title="Copy API URL"
              >
                {isCopied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-neutral-400 group-hover:text-indigo-500" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
