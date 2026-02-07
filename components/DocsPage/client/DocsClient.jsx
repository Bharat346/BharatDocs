"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useThemeContext } from "@/components/ThemeProvider";

import GridBackground from "@/components/GridBG";
import StatsPanel from "@/components/DocsPage/statsPanel";
import SearchBar from "@/components/DocsPage/searchBar";
import CollectionsGrid from "@/components/DocsPage/collectionsGrid";
import EmptyState from "@/components/DocsPage/EmptyState";
import DocsLoader from "../DocsLoader";

/* ---------------- API fetcher ---------------- */
const fetchDocs = async () => {
  const res = await fetch("/api/docs?collection=Docs&parentSlug=");
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
};

export default function DocsClient() {
  const { theme } = useThemeContext();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: rootNodes = [], isLoading } = useQuery({
    queryKey: ["docs", "root"],
    queryFn: fetchDocs,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  /* ---------------- Collections ---------------- */
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

  /* ---------------- Stats ---------------- */
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

  /* ---------------- Search ---------------- */
  const filteredCollections = useMemo(
    () =>
      collections.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [collections, searchTerm]
  );

  if (isLoading) return <DocsLoader theme={theme} />;

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
            <CollectionsGrid
              theme={theme}
              collections={filteredCollections}
            />
          )}
        </div>
      </div>
    </GridBackground>
  );
}
