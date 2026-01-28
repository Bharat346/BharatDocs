// app/(public)/docs/components/EmptyState.jsx
import { FileText } from "lucide-react";

export default function EmptyState({ theme, searchTerm }) {
  return (
    <div className={`text-center py-16 rounded-2xl ${
      theme === "dark" 
        ? "bg-zinc-900/50 border border-zinc-800" 
        : "bg-white/50 border border-gray-200"
    }`}>
      <FileText className={`h-16 w-16 mx-auto mb-4 ${
        theme === "dark" ? "text-zinc-700" : "text-gray-400"
      }`} />
      <h3 className={`text-xl font-semibold mb-2 ${
        theme === "dark" ? "text-zinc-300" : "text-gray-800"
      }`}>
        {searchTerm ? "No documents found" : "No collections available"}
      </h3>
      <p className={`${
        theme === "dark" ? "text-zinc-500" : "text-gray-600"
      }`}>
        {searchTerm 
          ? "Try a different search term" 
          : "Start by creating your first document collection"}
      </p>
    </div>
  );
}