"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useThemeContext } from "@/components/ThemeProvider";

import SearchBar from "@/components/DocsPage/shared/searchBar";
import CollectionsGrid from "@/components/DocsPage/shared/collectionsGrid";
import EmptyState from "@/components/DocsPage/shared/EmptyState";
import DocsLoader from "@/components/DocsPage/shared/DocsLoader";

import { fetchDocs } from "@/components/DocsPage/lib/docs.api.js";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DocsClient() {
  const { theme } = useThemeContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  /* ---------------- React Query with AbortController ---------------- */
  const {
    data: rootNodes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["docs", "root"],
    queryFn: ({ signal }) => fetchDocs(signal),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  /* ---------------- Collections (memoized) ---------------- */
  const collections = useMemo(
    () =>
      rootNodes.map((root) => ({
        id: root.nodeId,
        name: root.name,
        slug: root.slug,
        nodeType: root.nodeType,
        fileType: root.fileType,
        updatedAt: root.updatedAt,
      })),
    [rootNodes],
  );

  /* ---------------- Filtered & Sorted collections (memoized) ---------------- */
  const filteredCollections = useMemo(() => {
    let result = collections.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    result.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "updated") {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA; // Newest first
      }
      return 0;
    });

    return result;
  }, [collections, searchTerm, sortBy]);

  if (isLoading) return <DocsLoader theme={theme} />;
  if (isError)
    return <div className="p-8 text-red-500">Failed to load documents.</div>;

  return (
    <div
      className={`min-h-screen pt-24 pb-20 px-6 transition-colors duration-500 ${
        theme === "dark"
          ? "bg-[#0a0a0a] text-white"
          : "bg-white text-neutral-900"
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex flex-col gap-4 sm:gap-6">
          <Link
            href="/"
            className="group flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-indigo-500 transition-colors self-start"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />{" "}
            Back Home
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
            Docs{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              Library
            </span>
          </h1>
        </div>

        <div className="space-y-8">
          <SearchBar
            theme={theme}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredCount={filteredCollections.length}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {filteredCollections.length === 0 ? (
            <EmptyState theme={theme} searchTerm={searchTerm} />
          ) : (
            <CollectionsGrid theme={theme} collections={filteredCollections} />
          )}
        </div>
      </div>
    </div>
  );
}
