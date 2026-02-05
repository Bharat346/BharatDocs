import { Loader2 } from "lucide-react";

export default function NotesLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
      {/* Spinner */}
      <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />

      {/* Text */}
      <div className="font-mono text-blue-400 animate-pulse text-sm">
        Loading notes…
      </div>
    </div>
  );
}
