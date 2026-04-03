"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import NotesLoader from "@/components/NotesPage/shared/NotesLoader";
import Link from "next/link";
import { useRef } from "react";

const PDFViewer = dynamic(() => import("@/lib/PDF/pdf.viewer.js"), {
  ssr: false,
});

export default function PDFViewerClient({ path }) {
  const backLinkRef = useRef(null);
  const slug = path?.at(-1);
  const parentPath = path?.slice(0, -1).join("/") || "";
  const backHref = `/notes/${parentPath}`;

  const { data: nodes = [], isLoading, error } = useQuery({
    queryKey: ["pdf-node", slug],
    queryFn: async () => {
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
        <Link 
           href={backHref}
           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-block"
        >
          Go Back
        </Link>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950">
      <Link ref={backLinkRef} href={backHref} className="hidden" />
      <PDFViewer 
         fileUrl={node.filePath || node.slug} 
         nodeId={node.id || node.nodeId}
         onClose={() => backLinkRef.current?.click()} 
         backHref={backHref}
      />
    </div>
  );
}
