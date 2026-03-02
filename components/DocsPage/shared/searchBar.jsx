// app/(public)/docs/components/SearchBar.jsx
import { Search } from "lucide-react";

export default function SearchBar({
  theme,
  searchTerm,
  setSearchTerm,
  filteredCount,
}) {
  return (
    <div
      className={`rounded-2xl p-6 ${
        theme === "dark"
          ? "bg-zinc-900/70 border border-zinc-800"
          : "bg-white/70 border border-gray-200"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2
            className={`text-[clamp(1.5rem,5vw,2rem)] font-bold mb-2 ${
              theme === "dark" ? "text-zinc-100" : "text-gray-900"
            }`}
          >
            All Documents
          </h2>
          <p
            className={`${
              theme === "dark" ? "text-zinc-400" : "text-gray-600"
            }`}
          >
            Browse and manage your document collections
          </p>
        </div>

        <div className="relative w-full md:w-auto">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              theme === "dark" ? "text-zinc-500" : "text-gray-400"
            }`}
          />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full md:w-64 pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
              theme === "dark"
                ? "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:ring-blue-500 focus:ring-offset-zinc-900"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:ring-offset-white"
            }`}
          />
        </div>
      </div>

      {/* Search Results Info */}
      <div className="mt-4 flex items-center justify-between">
        <p
          className={`text-sm ${
            theme === "dark" ? "text-zinc-400" : "text-gray-600"
          }`}
        >
          Showing {filteredCount} documents
          {searchTerm && ` for "${searchTerm}"`}
        </p>

        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className={`text-sm px-3 py-1 rounded-md transition-colors ${
              theme === "dark"
                ? "text-zinc-400 hover:text-zinc-300 bg-zinc-800 hover:bg-zinc-700"
                : "text-gray-600 hover:text-gray-800 bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Clear Search
          </button>
        )}
      </div>
    </div>
  );
}
