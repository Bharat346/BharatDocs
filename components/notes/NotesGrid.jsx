import { Folder } from "lucide-react";
import NoteCard from "./NoteCard";

export default function NotesGrid({ notes = [] }) {
  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-[var(--border)] rounded-2xl glass-subtle">
        <Folder className="w-12 h-12 mx-auto text-[var(--fg-muted)] mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-[var(--fg)] mb-2">Folder is empty</h3>
        <p className="text-sm text-[var(--fg-muted)] max-w-sm mx-auto">
          No notes or subfolders found in this directory.
        </p>
      </div>
    );
  }

  // Separate folders and files for logical grouping
  const folders = notes.filter((n) => n.type === "folder");
  const files = notes.filter((n) => n.type === "note");

  return (
    <div className="space-y-12">
      {folders.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--fg-secondary)] mb-6 flex items-center gap-2">
            Folders
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {folders.map((folder, index) => (
              <NoteCard key={folder.id} note={folder} index={index} />
            ))}
          </div>
        </section>
      )}

      {files.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--fg-secondary)] mb-6 flex items-center gap-2">
            Files & Documents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {files.map((file, index) => (
              <NoteCard key={file.id} note={file} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
