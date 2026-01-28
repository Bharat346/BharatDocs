"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useThemeContext } from "@/components/ThemeProvider";
import GridBackground from "@/components/GridBG";
import StatsPanel from "@/components/DocsPage/statsPanel";
import SearchBar from "@/components/DocsPage/searchBar";
import CollectionsGrid from "@/components/DocsPage/collectionsGrid";
import LoadingState from "@/components/DocsPage/LoadingState";
import EmptyState from "@/components/DocsPage/EmptyState";
import { useState } from "react";

// API fetcher function
const fetchDocs = async () => {
  const response = await fetch("/api/docs?collection=Docs&parentSlug=");
  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }
  return response.json();
};

export default function DocsPage() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: rootNodes = [], isLoading } = useQuery({
    queryKey: ["docs", "root"],
    queryFn: fetchDocs,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });

  // Transform root nodes to collections format
  const collections = useMemo(() => {
    return rootNodes.map((root) => ({
      id: root.nodeId,
      name: root.name,
      slug: root.slug,
      nodeType: root.nodeType,
      fileType: root.fileType,
      updatedAt: root.updatedAt,
      docs: [],
      count: 0,
    }));
  }, [rootNodes]);

  // Calculate stats based on root nodes
  const stats = useMemo(() => {
    return {
      totalDocs: rootNodes.length,
      totalCollections: rootNodes.length,
      recentDocs: rootNodes.filter((doc) => {
        if (!doc.updatedAt) return false;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return new Date(doc.updatedAt) > sevenDaysAgo;
      }).length,
      pdfCount: rootNodes.filter((d) => d.fileType === "pdf").length,
      folderCount: rootNodes.filter((d) => d.nodeType === "folder").length,
      avgUpdateFrequency: "Weekly",
    };
  }, [rootNodes]);

  /* Handle collection/folder click */
  const handleCollectionClick = (collection) => {
    router.push(`/docs/${collection.slug}`);
  };

  /* Search filter - only search root folder names */
  const filteredCollections = collections.filter((col) =>
    col.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return <LoadingState theme={theme} />;
  }

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
        {/* Left Panel */}
        <StatsPanel theme={theme} stats={stats} />

        {/* Right Panel */}
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
              onCollectionClick={handleCollectionClick}
            />
          )}
        </div>
      </div>
    </GridBackground>
  );
}
