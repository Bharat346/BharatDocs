// components/NotesGrid.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { shouldPrefetch } from "@/lib/network/network.config";
import { Folder, FileText, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useThemeContext } from "@/components/ThemeProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import dynamic from "next/dynamic";
import NotesLoader from "@/components/NotesPage/shared/NotesLoader";

// Dynamically load PDF viewer
const PDFViewer = dynamic(() => import("@/lib/PDF/pdf.viewer.js"), {
  ssr: false,
});

// ---------------- Global cache for folder nodes ----------------
const folderCache = {};

export default function NotesGrid({
  nodes,
  slugArray,
  isLoading: parentLoading,
}) {
  const { theme } = useThemeContext();
  const isMobile = useIsMobile();

  const [starred, setStarred] = useState({});
  const [activePdf, setActivePdf] = useState(null);

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
      {/* ================= GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
        {nodes.map((node) => {
          const isFolder = node.nodeType === "folder";
          const pdfUrl = node.filePath || node.slug;

          return isFolder ? (
            <Link
              key={node.nodeId}
              href={`/notes/${[...slugArray, node.slug].join("/")}`}
              prefetch={shouldPrefetch()}
              className={`block`}
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
                  isFolder={true}
                  starred={starred}
                  toggleStar={toggleStar}
                />
              </Card>
            </Link>
          ) : (
            <Card
              key={node.nodeId}
              onClick={() => setActivePdf(pdfUrl)}
              className={`p-4 min-w-[300px] rounded-2xl shadow-lg cursor-pointer transition ${
                theme === "dark"
                  ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800/60"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <ItemContent
                node={node}
                theme={theme}
                isFolder={false}
                starred={starred}
                toggleStar={toggleStar}
              />
            </Card>
          );
        })}
      </div>

      {/* ================= PDF OVERLAY ================= */}
      {activePdf && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center pt-16">
          <div
            className={`w-full h-full max-w-5xl rounded-xl border ${
              theme === "dark"
                ? "border-zinc-700 bg-zinc-900"
                : "border-gray-200 bg-white"
            }`}
          >
            <Suspense fallback={<NotesLoader />}>
              <PDFViewer
                fileUrl={activePdf}
                onClose={() => setActivePdf(null)}
              />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
}

/* ================= ITEM ================= */
function ItemContent({ node, theme, isFolder, starred, toggleStar }) {
  return (
    <div className="flex gap-3">
      {isFolder ? (
        <Folder className="h-6 w-6 text-blue-400" />
      ) : (
        <FileText className="h-6 w-6 text-green-400" />
      )}

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3
            className={`font-black text-[clamp(0.875rem,2vw,1rem)] truncate ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {node.name}
          </h3>

          <button onClick={(e) => toggleStar(node, e)}>
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
  );
}

// ---------------- Export folder cache for global access ----------------
export { folderCache };
