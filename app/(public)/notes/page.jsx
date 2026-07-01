import NotesExplorerClient from "@/components/notes/NotesExplorerClient";
import { getCachedNotesByParentSlug } from "@/lib/db/queries/notes";

export const metadata = {
  title: "Study Notes & Resources",
};

export default async function NotesRootPage() {
  const notes = await getCachedNotesByParentSlug(null, null);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <br />
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[var(--fg)]">
          Notes
        </h1>
        <br />
        <NotesExplorerClient initialNotes={notes} initialSegments={[]} />
      </div>
    </div>
  );
}
