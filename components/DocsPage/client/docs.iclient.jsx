"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useThemeContext } from "@/components/ThemeProvider";

import GridBackground from "@/components/GridBG";
import StatsPanel from "@/components/DocsPage/shared/statsPanel";
import SearchBar from "@/components/DocsPage/shared/searchBar";
import CollectionsGrid from "@/components/DocsPage/shared/collectionsGrid";
import EmptyState from "@/components/DocsPage/shared/EmptyState";
import DocsLoader from "@/components/DocsPage/shared/DocsLoader";

import { fetchDocs } from "@/components/DocsPage/lib/docs.api.js";

export default function DocsClient() {
  const { theme } = useThemeContext();
  const [searchTerm, setSearchTerm] = useState("");

  /* ---------------- React Query with AbortController ---------------- */
  const { data: rootNodes = [], isLoading, isError } = useQuery({
    queryKey: ["docs", "root"],
    queryFn: ({ signal }) => fetchDocs(signal), // pass AbortSignal
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
    [rootNodes]
  );

  /* ---------------- Stats (memoized) ---------------- */
  const stats = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return {
      totalDocs: rootNodes.length,
      totalCollections: rootNodes.length,
      recentDocs: rootNodes.filter(
        (d) => d.updatedAt && new Date(d.updatedAt) > sevenDaysAgo
      ).length,
      pdfCount: rootNodes.filter((d) => d.fileType === "pdf").length,
      folderCount: rootNodes.filter((d) => d.nodeType === "folder").length,
      avgUpdateFrequency: "Weekly",
    };
  }, [rootNodes]);

  /* ---------------- Filtered collections (memoized) ---------------- */
  const filteredCollections = useMemo(
    () =>
      collections.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [collections, searchTerm]
  );

  if (isLoading) return <DocsLoader theme={theme} />;
  if (isError) return <div className="p-8 text-red-500">Failed to load documents.</div>;

  return (
    <GridBackground
      variant="dots"
      density="lg"
      intensity="xs"
      className="min-h-screen py-8"
      gradient
      blur
    >
      <div className="max-w-[90vw] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        <StatsPanel theme={theme} stats={stats} />

        <div className="lg:col-span-4 space-y-8">
          <SearchBar
            theme={theme}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredCount={filteredCollections.length}
          />

          {filteredCollections.length === 0 ? (
            <EmptyState theme={theme} searchTerm={searchTerm} />
          ) : (
            <CollectionsGrid theme={theme} collections={filteredCollections} />
          )}
        </div>
      </div>
    </GridBackground>
  );
}
