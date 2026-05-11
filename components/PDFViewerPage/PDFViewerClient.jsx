"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { useUserProfileStore } from "@/hooks/useUserProfile";
import { useThemeContext } from "@/components/ThemeProvider";
import PDFUniversalLoader from "./PDFUniversalLoader";

const PDFViewer = dynamic(() => import("@/lib/PDF/pdf.viewer.js"), {
  ssr: false,
  loading: () => <PDFUniversalLoader text="Initializing Viewer..." />,
});

export default function PDFViewerClient({ path }) {
  const backLinkRef = useRef(null);
  const slug = path?.at(-1);
  const parentPath = path?.slice(0, -1).join("/") || "";
  const backHref = `/notes/${parentPath}`;
  const { theme } = useThemeContext();
  const isDark = theme === "dark";

  const {
    data: node,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pdf-node", slug],
    queryFn: async () => {
      const res = await fetch(`/api/notes/node/${slug}`, {
        // Enable Next.js fetch cache — revalidate every 5 minutes
        next: { revalidate: 300 },
      });
      if (!res.ok) throw new Error("Failed to fetch PDF data");
      const data = await res.json();
      // API returns a single object (not array) from the updated route
      return Array.isArray(data) ? data[0] : data;
    },
    enabled: !!slug,
    // Client-side caching via React Query
    staleTime: 5 * 60 * 1000, // 5 min — data stays fresh
    gcTime: 30 * 60 * 1000, // 30 min — cache garbage collection
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    refetchOnMount: false, // Don't refetch on remount if fresh
    retry: 2,
  });

  const addActivity = useUserProfileStore((state) => state.addActivity);

  useEffect(() => {
    if (node && !isLoading && !error) {
      addActivity({
        type: "view",
        title: node.name || slug,
        url: `/pdf/${parentPath}/${slug}`,
      });
    }
  }, [node, isLoading, error, slug, parentPath, addActivity]);

  if (isLoading) return <PDFUniversalLoader text="Fetching Document Data..." />;

  if (error || !node)
    return (
      <div
        className={`flex items-center justify-center h-screen transition-colors duration-300 ${
          isDark ? "bg-zinc-950 text-zinc-400" : "bg-gray-100 text-gray-500"
        }`}
      >
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1
            className={`text-xl font-bold mb-2 ${isDark ? "text-zinc-200" : "text-gray-800"}`}
          >
            Document Not Found
          </h1>
          <p
            className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-gray-500"}`}
          >
            The document you're looking for was not found or has been removed.
          </p>
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
          >
            Go Back
          </Link>
        </div>
      </div>
    );

  return (
    <div
      className={`h-screen w-screen overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-zinc-950" : "bg-gray-100"
      }`}
    >
      <Link ref={backLinkRef} href={backHref} className="hidden" />
      <PDFViewer
        fileUrl={node.filePath || node.slug}
        nodeId={node.nodeId || node.id}
        docTitle={node.name || slug}
        onClose={() => backLinkRef.current?.click()}
        backHref={backHref}
      />
    </div>
  );
}
