"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Breadcrumbs from "@/components/NotesPage/Breadcrumbs";
import NotesGrid , {folderCache} from "@/components/NotesPage/NotesGrid";

// API fetcher function
const fetchNotes = async (collectionName, parentSlug) => {
  const apiUrl = `/api/notes?collection=${collectionName}${
    parentSlug ? `&parentSlug=${parentSlug}` : ""
  }`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch notes (${response.status})`);
  }
  return response.json();
};

export default function NotesPathClient() {
  const params = useParams();
  const slugArray = Array.isArray(params?.path) ? params.path : [];
  const lastSlug = slugArray.at(-1) ?? null;
  const folderKey = slugArray.join("/") || "root";
  const collectionName = "Notes";

  const cachedNodes = folderCache[folderKey];

  const {
    data: nodes = cachedNodes || [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notes", collectionName, lastSlug || "root"],
    queryFn: () => fetchNotes(collectionName, lastSlug),
    enabled : !cachedNodes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour cache
    keepPreviousData: true,
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
