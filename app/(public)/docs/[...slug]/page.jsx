import { notFound } from "next/navigation";
import Link from "next/link";
import { Folder, FileText } from "lucide-react";
import DocViewer from "@/components/docs/DocViewer";
import TableOfContents from "@/components/docs/TableOfContents";
import { getCachedAllDocs } from "@/lib/db/queries/docs";
import { getProcessedMDX } from "@/lib/mdx";
import DocsList from "@/components/docs/DocsList";
import ShareButtons from "@/components/shared/ShareButtons";

// Resolve node by exact path in memory
async function resolveNodeByPath(slugArray) {
  const allDocs = await getCachedAllDocs();
  let currentParentId = null;
  let currentNode = null;

  for (const segment of slugArray) {
    currentNode = allDocs.find(
      d => d.slug === segment && (d.parentId === currentParentId || (!d.parentId && !currentParentId))
    );
    if (!currentNode) return null;
    currentParentId = currentNode.id;
  }
  return currentNode;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const node = await resolveNodeByPath(slug);

  if (!node) return { title: "Not Found" };

  return {
    title: node.name,
    description: node.description || `Documentation for ${node.name}`,
  };
}

export default async function DocPage({ params }) {
  const { slug } = await params;

  // 1. Fetch current node
  const currentNode = await resolveNodeByPath(slug);
  if (!currentNode) notFound();

  // 2. Render Folder View — simple list of children (sidebar handles navigation)
  if (currentNode.type === "folder") {
    const allDocs = await getCachedAllDocs();
    const children = allDocs.filter(d => d.parentId === currentNode.id).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    const folders = children.filter(c => c.type === "folder");
    const files = children.filter(c => c.type === "document");

    return (
      <main className="flex-1 w-full min-w-0 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-black text-[var(--fg)] mb-2 tracking-tight">{currentNode.name}</h1>
          {currentNode.description && (
            <p className="text-[var(--fg-secondary)] mb-8">{currentNode.description}</p>
          )}

          <DocsList childrenDocs={children} basePath={`/docs/${slug.join("/")}`} />
        </div>
      </main>
    );
  }

  // 4. Render Document View
  if (!currentNode.filePath || currentNode.fileType !== "mdx") {
    // If it's a PDF, we shouldn't be here (handled by target="_blank" on Links)
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h1 className="text-2xl font-bold text-[var(--fg)] mb-4">Unsupported File Type</h1>
        <p className="text-[var(--fg-muted)]">This document type cannot be viewed inline.</p>
      </div>
    );
  }

  // Compile MDX
  let content, headings;
  try {
    const mdxResult = await getProcessedMDX(currentNode.filePath);
    content = mdxResult.content;
    headings = mdxResult.headings;
  } catch (error) {
    return (
      <main className="flex-1 w-full min-w-0 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center border border-red-500/20 bg-red-500/10 p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error loading document</h2>
          <p className="text-[var(--fg-secondary)] text-sm mb-4">{error.message}</p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row w-full gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 items-start">
      <main className="flex-1 w-full min-w-0 max-w-3xl">
        {headings && headings.length > 0 && (
          <div className="xl:hidden">
            <TableOfContents headings={headings} />
          </div>
        )}
        <DocViewer content={content} />

        <ShareButtons title={currentNode.name} />

        <div className="mt-8 pt-8 border-t border-[var(--border)] flex justify-between items-center text-sm text-[var(--fg-muted)]">
          <span>Last updated on {new Date(currentNode.updatedAt).toLocaleDateString()}</span>
        </div>
      </main>

      {headings && headings.length > 0 && (
        <aside className="hidden xl:block w-64 flex-shrink-0 sticky top-24">
          <TableOfContents headings={headings} />
        </aside>
      )}
    </div>
  );
}
