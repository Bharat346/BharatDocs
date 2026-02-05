"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useThemeContext } from "@/components/ThemeProvider";

import GridBackground from "@/components/GridBG";
import StatsPanel from "@/components/DocsPage/statsPanel";
import SearchBar from "@/components/DocsPage/searchBar";
import CollectionsGrid from "@/components/DocsPage/collectionsGrid";
import LoadingState from "@/components/DocsPage/LoadingState";
import EmptyState from "@/components/DocsPage/EmptyState";

/* ---------------- API fetcher ---------------- */
const fetchDocs = async () => {
  const response = await fetch("/api/docs?collection=Docs&parentSlug=");
  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }
  return response.json();
};

export default function DocsClient() {
  const router = useRouter();
  const { theme } = useThemeContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [navigating, setNavigating] = useState(false);

  const { data: rootNodes = [], isLoading } = useQuery({
    queryKey: ["docs", "root"],
    queryFn: fetchDocs,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  /* ---------------- Collections transform ---------------- */
  const collections = useMemo(() => {
    return rootNodes.map((root) => ({
      id: root.nodeId,
      name: root.name,
      slug: root.slug,
      nodeType: root.nodeType,
      fileType: root.fileType,
      updatedAt: root.updatedAt,
    }));
  }, [rootNodes]);

  /* ---------------- Stats ---------------- */
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

  /* ---------------- Navigation ---------------- */
  const handleCollectionClick = (collection) => {
    if (navigating) return;
    setNavigating(true);
    router.push(`/docs/${collection.slug}`);
  };

  /* ---------------- Search ---------------- */
  const filteredCollections = collections.filter((col) =>
    col.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <LoadingState theme={theme} />;
  }

  return (
    <>
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
                onCollectionClick={handleCollectionClick}
              />
            )}
          </div>
        </div>
      </GridBackground>

      {/* {navigating && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="font-mono text-blue-400 animate-pulse">
            Opening collection…
          </div>
        </div>
      )} */}
    </>
  );
}
