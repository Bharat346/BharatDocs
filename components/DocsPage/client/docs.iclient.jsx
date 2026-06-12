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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selectedTags, setSelectedTags] = useState([]);

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

  /* ---------------- Collections & Tags (memoized) ---------------- */
  const { collections, allTags } = useMemo(() => {
    const colls = rootNodes.map((root) => ({
      id: root.nodeId,
      name: root.name,
      slug: root.slug,
      nodeType: root.nodeType,
      fileType: root.fileType,
      updatedAt: root.updatedAt,
      tags: root.tags || [],
    }));

    const tagCounts = {};
    colls.forEach((c) => {
      c.tags.forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });

    // Sort by frequency and take top 15
    const tags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 15);

    return { collections: colls, allTags: tags.sort() };
  }, [rootNodes]);

  /* ---------------- Filtered & Sorted collections (memoized) ---------------- */
  const filteredCollections = useMemo(() => {
    let result = collections.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => c.tags.includes(tag));
      return matchesSearch && matchesTags;
    });

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
  }, [collections, searchTerm, sortBy, selectedTags]);

  if (isLoading) return <DocsLoader />;
  if (isError)
    return <div className="p-8 text-red-500">Failed to load documents.</div>;

  return (
    <div className="min-h-screen max-w-7xl mx-auto mt-10 pt-24 pb-10 px-6 transition-colors duration-500 bg-background text-foreground">
      {/* Premium Modern Header Area */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
            <div className="space-y-1">
              <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase text-foreground leading-[0.8]">
                The{" "}
                <span className="text-primary">
                  Archives
                </span>
              </h1>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 tracking-widest uppercase pl-1">
                Documentation & Guides
              </p>
            </div>
          </div>

          <div className="relative w-full max-w-sm group">
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredCount={filteredCollections.length}
              sortBy={sortBy}
              setSortBy={setSortBy}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              allTags={allTags}
              onlySearch={true}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-border via-border to-transparent" />
      </div>

      <div className="space-y-6">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredCount={filteredCollections.length}
          sortBy={sortBy}
          setSortBy={setSortBy}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          allTags={allTags}
          onlyFilters={true}
        />

      </div>
        {filteredCollections.length === 0 ? (
          <EmptyState searchTerm={searchTerm} />
        ) : (
          <CollectionsGrid collections={filteredCollections} />
        )}
    </div>
  );
}
