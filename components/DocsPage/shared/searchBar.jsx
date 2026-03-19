// app/(public)/docs/components/SearchBar.jsx
import { Search, X, ArrowDownAZ, Clock } from "lucide-react";

export default function SearchBar({
  theme,
  searchTerm,
  setSearchTerm,
  filteredCount,
  sortBy,
  setSortBy,
}) {
  const isDark = theme === "dark";

  return (
    <div className="space-y-8 w-full">
      {/* Massive Premium Search Input */}
      <div className="relative">
        <div
          className={`absolute inset-y-0 left-0 pl-5 sm:pl-6 flex items-center pointer-events-none ${
            isDark ? "text-neutral-500" : "text-neutral-400"
          }`}
        >
          <Search className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search collections..."
          className={`block w-full pl-12 sm:pl-16 pr-14 sm:pr-16 py-5 sm:py-6 text-lg sm:text-xl md:text-2xl font-medium rounded-[2rem] sm:rounded-[2.5rem] border-2 transition-all duration-300 outline-none ${
            isDark
              ? "bg-neutral-900/50 border-neutral-800 text-white placeholder-neutral-600 focus:bg-neutral-900 focus:border-indigo-500/50 focus:shadow-[0_0_30px_rgba(99,102,241,0.1)]"
              : "bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-indigo-500 focus:shadow-[0_0_30px_rgba(99,102,241,0.15)]"
          }`}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className={`absolute inset-y-0 right-0 pr-5 sm:pr-6 flex items-center transition-colors ${
              isDark ? "text-neutral-500 hover:text-white" : "text-neutral-400 hover:text-black"
            }`}
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}
      </div>

      {/* Results Tracking Info & Sort Menu */}
      <div className="flex items-center justify-between gap-2 text-[12px] sm:text-xs font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-100 dark:border-neutral-800 pb-3 sm:pb-4">
        <span className="truncate pr-2">
          {filteredCount} {filteredCount === 1 ? "doc" : "docs"}{" "}
          <span className="hidden sm:inline">found</span>{" "}
          <span className="hidden sm:inline">{searchTerm && `for "${searchTerm}"`}</span>
        </span>

        <button
          onClick={() => setSortBy(sortBy === "name" ? "updated" : "name")}
          title={`Sort by ${sortBy === "name" ? "Time Updated" : "Name (A-Z)"}`}
          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
            isDark
              ? "bg-neutral-800/40 hover:bg-neutral-800 text-indigo-400"
              : "bg-neutral-100/50 hover:bg-neutral-200 text-indigo-600"
          }`}
        >
          <span className="text-[12px]">Sort By :</span> {sortBy === "name" ? <ArrowDownAZ className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          <span className="hidden sm:inline-block">
            {sortBy === "name" ? "Name" : "Updated"}
          </span>
        </button>
      </div>
    </div>
  );
}
