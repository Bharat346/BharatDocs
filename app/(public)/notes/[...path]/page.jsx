"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Breadcrumbs from "@/components/NotesPage/Breadcrumbs";
import NotesGrid from "@/components/NotesPage/NotesGrid";
import SEO from "@/components/SEO/SEO";

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

export default function NotesPathPage() {
  const params = useParams();

  const slugArray = params?.path ?? [];
  const lastSlug = slugArray.length ? slugArray[slugArray.length - 1] : null;

  const collectionName = "Notes";

  const {
    data: nodes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notes", collectionName, lastSlug || "root"],
    queryFn: () => fetchNotes(collectionName, lastSlug),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour cache
    keepPreviousData: true,
  });

  //Dynamic SEO values
  const title = lastSlug ? `${lastSlug.toUpperCase()} | Notes` : "Notes";
  const description = nodes.length
    ? `Browse ${nodes.length} notes in ${lastSlug ?? "the collection"}.`
    : "Explore notes in this collection.";
  const url = `https://bhdocs.in/notes/${slugArray.join("/")}`;

  if (error) {
    return (
      <>
      <SEO title="Notes | My App" description="Failed to load notes" url={url} />
        <Breadcrumbs slugArray={slugArray} />
        <div className="py-12 text-center text-red-500">{error.message}</div>
      </>
    );
  }

  return (
    <div>
      <SEO title={title} description={description} url={url} />
      <Breadcrumbs slugArray={slugArray} />
      <br />
      <NotesGrid nodes={nodes} slugArray={slugArray} isLoading={isLoading} />
    </div>
  );
}
