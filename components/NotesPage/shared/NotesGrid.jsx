// components/NotesGrid.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { shouldPrefetch } from "@/lib/network/network.config";
import { Folder, FileText, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useThemeContext } from "@/components/ThemeProvider";
import NotesLoader from "@/components/NotesPage/shared/NotesLoader";

// ---------------- Global cache for folder nodes ----------------
const folderCache = {};

export default function NotesGrid({
  nodes,
  slugArray,
  isLoading: parentLoading,
}) {
  const { theme } = useThemeContext();
  const [starred, setStarred] = useState({});

  /* ---------------- Load starred from localStorage ---------------- */
  useEffect(() => {
    const stored = localStorage.getItem("starred");
    if (stored) setStarred(JSON.parse(stored));
  }, []);

  /* ---------------- Toggle star ---------------- */
  const toggleStar = (node, e) => {
    e.preventDefault();
    e.stopPropagation();

    const next = { ...starred };
    next[node.nodeId] ? delete next[node.nodeId] : (next[node.nodeId] = node);

    setStarred(next);
    localStorage.setItem("starred", JSON.stringify(next));
  };

  /* ---------------- Loading / Empty ---------------- */
  if (parentLoading) return <NotesLoader />;
  if (!nodes?.length)
    return (
      <div className="text-center py-12">
        <Folder className="h-12 w-12 mx-auto text-blue-400" />
        <p className="text-blue-300 mt-4">No content found</p>
      </div>
    );

  /* ---------------- Cache current folder ---------------- */
  const folderKey = slugArray.join("/") || "root";
  folderCache[folderKey] = nodes;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
        {nodes.map((node) => {
          const isFolder = node.nodeType === "folder";
          const href = isFolder
            ? `/notes/${[...slugArray, node.slug].join("/")}`
            : `/pdf/${[...slugArray, node.slug].join("/")}`;

          return (
            <Link
              key={node.nodeId}
              href={href}
              prefetch={shouldPrefetch()}
              className="block"
            >
              <Card
                className={`p-4 min-w-[300px] rounded-2xl shadow-lg cursor-pointer transition ${
                  theme === "dark"
                    ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800/60"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <ItemContent
                  node={node}
                  theme={theme}
                  isFolder={isFolder}
                  starred={starred}
                  toggleStar={toggleStar}
                />
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}

/* ================= ITEM ================= */
function ItemContent({ node, theme, isFolder, starred, toggleStar }) {
  return (
    <div className="flex gap-3 min-w-0">
      {isFolder ? (
        <Folder className="h-6 w-6 text-blue-400 shrink-0" />
      ) : (
        <FileText className="h-6 w-6 text-green-400 shrink-0" />
      )}

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-start gap-3 mb-1.5">
          <h3
            title={node.name}
            className={`font-black text-[clamp(0.875rem,2vw,1rem)] truncate flex-1 min-w-0 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {node.name}
          </h3>

          <button onClick={(e) => toggleStar(node, e)} className="shrink-0 mt-0.5 relative z-10 p-1 -m-1">
            <Star
              size={14}
              className={
                starred[node.nodeId]
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-400"
              }
            />
          </button>
        </div>

        <div>
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              isFolder
                ? theme === "dark"
                  ? "bg-blue-800/30 text-blue-400"
                  : "bg-blue-50 text-blue-600"
                : theme === "dark"
                  ? "bg-green-800/30 text-green-400"
                  : "bg-green-50 text-green-600"
            }`}
          >
            {isFolder ? "Folder" : node.fileType || "File"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------- Export folder cache for global access ----------------
export { folderCache };
