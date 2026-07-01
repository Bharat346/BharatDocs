import { getCachedAllDocs } from "@/lib/db/queries/docs";
import DocsList from "@/components/docs/DocsList";

export const metadata = {
  title: "Documentation",
  description: "Explore curated developer documentation, guides, and references.",
};

export default async function DocsRootPage() {
  // Fetch all docs and filter for root level docs (parentId = null)
  const allDocs = await getCachedAllDocs();
  const children = allDocs.filter(d => d.parentId === null).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  return (
    <main className="flex-1 w-full min-w-0 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl">
        <br />
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--fg)] mb-12">
          Documentation
        </h1>
        <DocsList childrenDocs={children} />
      </div>
    </main>
  );
}
