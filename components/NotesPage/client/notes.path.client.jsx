"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Breadcrumbs from "@/components/NotesPage/shared/Breadcrumbs";
import NotesGrid, { folderCache } from "@/components/NotesPage/shared/NotesGrid";
import { fetchNotes } from "@/components/NotesPage/lib/notes.api.js";

// Safe RIC helper with timeout fallback
const ric = (callback, timeout = 200) => {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 0);
  }
};

export default function NotesPathClient() {
  const params = useParams();
  const slugArray = Array.isArray(params?.path) ? params.path : [];
  const lastSlug = slugArray.at(-1) ?? null;
  const folderKey = slugArray.join("/") || "root";
  const collectionName = "Notes";

  const cachedNodes = folderCache[folderKey];
  const queryClient = useQueryClient();

  const { data: nodes = cachedNodes || [], isLoading, error } = useQuery({
    queryKey: ["notes", collectionName, lastSlug || "root"],
    queryFn: ({ signal }) => fetchNotes(collectionName, lastSlug, signal),
    enabled: !cachedNodes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
    keepPreviousData: true,
    onSuccess: (data) => {
      // Prefetch child folders without blocking UI
      ric(() => {
        data
          .filter((n) => n.nodeType === "folder")
          .forEach((folder) => {
            queryClient.prefetchQuery({
              queryKey: ["notes", collectionName, folder.slug],
              queryFn: ({ signal }) => fetchNotes(collectionName, folder.slug, signal),
            });
          });
      }, 200); // timeout ensures it runs within 200ms even if idle not detected
    },
  });

  if (error) {
    return (
      <>
        <Breadcrumbs slugArray={slugArray} />
        <div className="py-12 text-center text-red-500">{error.message}</div>
      </>
    );
  }

  return (
    <div>
      <Breadcrumbs className="mt-1" slugArray={slugArray} />
      <br />
      <NotesGrid nodes={nodes} slugArray={slugArray} isLoading={isLoading} />
    </div>
  );
}
