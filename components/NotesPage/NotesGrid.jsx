"use client";

import Link from "next/link";
import { Folder, FileText, Star, ExternalLink, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useThemeContext } from "../ThemeProvider";
import PdfViewer from "./PdfViewer";
import { useIsMobile } from "@/hooks/use-mobile";

export default function NotesGrid({
  nodes,
  slugArray,
  isLoading: parentLoading,
}) {
  const { theme } = useThemeContext();
  const isMobile = useIsMobile();

  const [starred, setStarred] = useState({});
  const [activePdf, setActivePdf] = useState(null);

  /* ---------------- Load starred ---------------- */

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

  /* ---------------- Loading ---------------- */

  if (parentLoading)
    return (
      <div className="text-center py-12">
        <Folder className="h-12 w-12 mx-auto text-blue-400 animate-pulse" />
        <p className="text-blue-300 mt-4">Loading...</p>
      </div>
    );

  if (!nodes?.length)
    return (
      <div className="text-center py-12">
        <Folder className="h-12 w-12 mx-auto text-blue-400" />
        <p className="text-blue-300 mt-4">No content found</p>
      </div>
    );

  /* ---------------- Render ---------------- */

  return (
    <>
      {/* ================= GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {nodes.map((node) => {
          const isFolder = node.nodeType === "folder";
          const pdfUrl = node.filePath || node.slug;

          const handleFileClick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (isMobile) {
              setActivePdf(pdfUrl);
            } else {
              window.open(pdfUrl, "_blank", "noopener,noreferrer");
            }
          };

          return (
            <Card
              key={node.nodeId}
              className={`p-4 rounded-2xl shadow-lg cursor-pointer transition ${
                theme === "dark"
                  ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800/60"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              {isFolder ? (
                <Link
                  href={`/notes/${[...slugArray, node.slug].join("/")}`}
                  className="block"
                >
                  <ItemContent
                    node={node}
                    theme={theme}
                    isFolder
                    starred={starred}
                    toggleStar={toggleStar}
                  />
                </Link>
              ) : (
                <div onClick={handleFileClick}>
                  <ItemContent
                    node={node}
                    theme={theme}
                    isFolder={false}
                    starred={starred}
                    toggleStar={toggleStar}
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* ================= MOBILE PDF OVERLAY ================= */}
      {isMobile && activePdf && (
        <>
          <div className="fixed inset-0 z-[999999] pt-16 bg-black">
            <button
              onClick={() => setActivePdf(null)}
              className="fixed top-40 right-0 z-[1000000] bg-black/70 p-2 rounded-full text-white"
            >
              <X size={18} />
            </button>

            <PdfViewer url={activePdf} />
          </div>
        </>
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
        <div className="flex justify-between">
          <h3
            className={`font-medium text-sm truncate ${theme === "dark" ? "text-white group-hover:text-blue-400" : "text-gray-900 group-hover:text-blue-600"}`}
          >
            {" "}
            {node.name}{" "}
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
          className={`text-[10px] px-2 py-0.5 rounded-full ${isFolder ? (theme === "dark" ? "bg-blue-800/30 text-blue-400" : "bg-blue-50 text-blue-600") : theme === "dark" ? "bg-green-800/30 text-green-400" : "bg-green-50 text-green-600"}`}
        >
          {" "}
          {isFolder ? "Folder" : node.fileType || "File"}{" "}
        </span>
      </div>
    </div>
  );
}
