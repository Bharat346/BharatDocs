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

  return (
    <div className="space-y-8 w-full">
      {/* Massive Premium Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 sm:pl-6 flex items-center pointer-events-none text-neutral-400 dark:text-zinc-500">
          <Search className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search collections..."
          className="block w-full pl-12 sm:pl-16 pr-14 sm:pr-16 py-5 sm:py-6 text-lg sm:text-xl md:text-2xl font-medium rounded-[2rem] sm:rounded-[2.5rem] border-2 transition-all duration-300 outline-none bg-background border-border text-foreground placeholder-neutral-400 focus:bg-background focus:border-indigo-500 focus:shadow-[0_0_30px_rgba(99,102,241,0.15)]"
        />
        {(searchTerm || selectedTags.length > 0) && (
          <button
            onClick={clearFilters}
            className="absolute inset-y-0 right-0 pr-5 sm:pr-6 flex items-center transition-colors text-neutral-400 hover:text-black dark:text-zinc-500 dark:hover:text-white"
            title="Clear all filters"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}
      </div>

      {/* Tags Filter section */}
      {allTags.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
              Filter by Tags
            </span>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 hover:text-indigo-600 transition-colors"
              >
                Reset Tags
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
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 border ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-200 dark:shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                      : "bg-background border-border text-neutral-600 hover:border-neutral-300 hover:bg-secondary-bg shadow-sm dark:text-zinc-400"
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
      <div className="flex items-center justify-between gap-2 text-[12px] sm:text-xs font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-100 dark:border-neutral-800 pb-3 sm:pb-4">
        <span className="truncate pr-2">
          {filteredCount} {filteredCount === 1 ? "doc" : "docs"}{" "}
          <span className="hidden sm:inline">found</span>{" "}
          <span className="hidden sm:inline">
            {searchTerm && `for "${searchTerm}"`}
            {selectedTags.length > 0 &&
              ` in ${selectedTags.length} ${selectedTags.length === 1 ? "tag" : "tags"}`}
          </span>
        </span>

        <button
          onClick={() => setSortBy(sortBy === "name" ? "updated" : "name")}
          title={`Sort by ${sortBy === "name" ? "Time Updated" : "Name (A-Z)"}`}
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors bg-secondary-bg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-indigo-600 dark:text-indigo-400"
        >
          <span className="text-[12px]">Sort By :</span>{" "}
          {sortBy === "name" ? (
            <ArrowDownAZ className="w-5 h-5" />
          ) : (
            <Clock className="w-5 h-5" />
          )}
          <span className="hidden sm:inline-block">
            {sortBy === "name" ? "Name" : "Updated"}
          </span>
        </button>
      </div>
    </div>
  );
}
