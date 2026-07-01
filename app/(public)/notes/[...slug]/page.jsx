import { notFound } from "next/navigation";
import NotesExplorerClient from "@/components/notes/NotesExplorerClient";
import DocViewer from "@/components/docs/DocViewer";
import TableOfContents from "@/components/docs/TableOfContents";
import { getCachedNotesByParentSlug } from "@/lib/db/queries/notes";
import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getProcessedMDX } from "@/lib/mdx";
import ShareButtons from "@/components/shared/ShareButtons";

async function getNoteNode(slugString) {
  const node = await db
    .select()
    .from(notes)
    .where(and(eq(notes.slug, slugString), eq(notes.isPublished, true)))
    .limit(1);
  return node[0] || null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const currentSlug = slug[slug.length - 1];
  const node = await getNoteNode(currentSlug);

  if (!node) return { title: "Not Found" };

  return {
    title: node.name,
    description: node.description || `Study notes for ${node.name}`,
  };
}

export default async function NotePage({ params }) {
  const { slug } = await params;
  const currentSlug = slug[slug.length - 1];

  // 1. Fetch current node
  const currentNode = await getNoteNode(currentSlug);
  if (!currentNode) notFound();

  // 2. Render Folder View
  if (currentNode.type === "folder") {
    const children = await getCachedNotesByParentSlug(currentSlug, null);
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NotesExplorerClient initialNotes={children} initialSegments={slug} />
        </div>
      </div>
    );
  }

  // 3. Render Document View
  if (!currentNode.filePath || currentNode.fileType !== "mdx") {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h1 className="text-2xl font-bold text-[var(--fg)] mb-4">Unsupported File Type</h1>
        <p className="text-[var(--fg-muted)]">This note type cannot be viewed inline.</p>
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
      <div className="max-w-3xl mx-auto text-center border border-red-500/20 bg-red-500/10 p-8 rounded-2xl mt-12">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error loading note</h2>
        <p className="text-[var(--fg-secondary)] text-sm mb-4">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <NotesBreadcrumb segments={slug} />

      <div className="flex flex-col lg:flex-row w-full relative pt-8 border-t border-[var(--border)] gap-12 justify-center">
        <main className="flex-1 w-full max-w-3xl min-w-0">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--fg)] mb-6">
            {currentNode.name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-[var(--fg-muted)] mb-12 pb-8 border-b border-[var(--border)]">
            <span>Updated {new Date(currentNode.updatedAt).toLocaleDateString()}</span>
          </div>

          <DocViewer content={content} />
          
          <ShareButtons title={currentNode.name} />
        </main>

        {headings && headings.length > 0 && (
          <TableOfContents headings={headings} />
        )}
      </div>
    </div>
  );
}
