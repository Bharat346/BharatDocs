// app/(public)/docs/components/SearchBar.jsx
import { Search, X, ArrowDownAZ, Clock } from "lucide-react";

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  filteredCount,
  sortBy,
  setSortBy,
  selectedTags = [],
  setSelectedTags,
  allTags = [],
  onlySearch = false,
  onlyFilters = false,
}) {
  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
  };

  if (onlySearch) {
    return (
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search the archives..."
          className="w-full pl-11 pr-10 py-3 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all shadow-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5 text-neutral-400" />
          </button>
        )}
      </div>
    );
  }

  if (onlyFilters) {
    return (
      <div className="space-y-6 mt-6">
        {/* Tags Filter section */}
        {allTags.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                        : "bg-background border-border text-neutral-500 hover:border-neutral-300 hover:text-foreground"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Tracking Info & Sort Menu */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 truncate">
            {filteredCount} {filteredCount === 1 ? "document" : "documents"} available
          </span>

          <button
            onClick={() => setSortBy(sortBy === "name" ? "updated" : "name")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all bg-secondary-bg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest"
          >
            Sort By: {sortBy === "name" ? "A-Z" : "Latest"}
            {sortBy === "name" ? (
              <ArrowDownAZ className="w-3.5 h-3.5" />
            ) : (
              <Clock className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
