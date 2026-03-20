"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import NotesLoader from "@/components/NotesPage/shared/NotesLoader";
import { useRouter } from "next/navigation";

const PDFViewer = dynamic(() => import("@/lib/PDF/pdf.viewer.js"), {
  ssr: false,
});

export default function PDFViewerClient({ path }) {
  const router = useRouter();
  const slug = path?.at(-1);

  // We need to fetch the node details (especially filePath)
  // For now, we'll try to fetch it via the notes API
  // We might need to adjust the API to allow fetching a single node by slug
  const { data: nodes = [], isLoading, error } = useQuery({
    queryKey: ["pdf-node", slug],
    queryFn: async () => {
       // Search for the node in its parent's folder OR we might need a dedicated API
       // A quick hack is to fetch without parentSlug if it's top level,
       // but we really need a way to find it.
       // For now, let's assume the API can handle a direct slug if we add it.
       const res = await fetch(`/api/notes/node/${slug}`);
       if (!res.ok) throw new Error("Failed to fetch PDF data");
       return res.json();
    },
    enabled: !!slug
  });

  const node = nodes[0] || nodes; // API might return array or object

  if (isLoading) return <NotesLoader />;
  if (error || !node) return (
    <div className="flex items-center justify-center h-screen bg-zinc-950 text-zinc-400">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">PDF Not Found</h1>
        <p>The document you're looking for was not found or has been removed.</p>
        <button 
           onClick={() => router.back()}
           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950">
      <PDFViewer 
         fileUrl={node.filePath || node.slug} 
         onClose={() => router.back()} 
      />
    </div>
  );
}
