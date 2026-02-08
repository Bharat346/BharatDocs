"use client";

import { useQuery } from "@tanstack/react-query";
import Breadcrumbs from "@/components/NotesPage/shared/Breadcrumbs";
import NotesGrid from "@/components/NotesPage/shared/NotesGrid";
import { fetchNotes } from "@/components/NotesPage/lib/notes.api";

export default function NotesClient() {
  const slugArray = [];

  const {
    data: nodes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notes", "root"],
    queryFn: ({signal}) => fetchNotes("Notes", null, signal),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000 * 24, // 24 hour cache,
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
