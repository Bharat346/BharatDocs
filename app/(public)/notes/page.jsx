"use client";

import { useQuery } from "@tanstack/react-query";
import Breadcrumbs from "@/components/NotesPage/Breadcrumbs";
import NotesGrid from "@/components/NotesPage/NotesGrid";

// API fetcher function
const fetchNotes = async () => {
  const response = await fetch("/api/notes?collection=Notes&parentSlug=");
  if (!response.ok) {
    throw new Error("Failed to fetch notes");
  }
  return response.json();
};

export default function NotesPage() {
  const slugArray = [];

  const {
    data: nodes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notes", "root"],
    queryFn: fetchNotes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour cache,
    keepPreviousData: true,
  });

  if (error) {
    return (
      <>
        <Breadcrumbs slugArray={slugArray} />
        <div className="text-red-500 text-center py-10">
          {error.message || "Something went wrong"}
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumbs slugArray={slugArray} />
      <NotesGrid nodes={nodes} slugArray={slugArray} isLoading={isLoading} />
    </>
  );
}
