export const CategorySelector = ({ category, onChange }) => {
  const cardBase =
    "px-6 py-4 rounded-2xl border transition-all duration-300 text-left relative group overflow-hidden shadow-sm";
  const cardTheme =
    "bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700";

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
        Collection Selection
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange("docs")}
          className={`${cardBase} ${cardTheme} ${
            category === "docs"
              ? "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
              : ""
          }`}
        >
          <div className="flex items-center gap-4 relative z-10">
            <div
              className={`w-4 h-4 rounded-full border-4 transition-colors ${category === "docs" ? "border-blue-500 bg-white dark:bg-black" : "border-neutral-200 dark:border-neutral-800"}`}
            />
            <div>
              <div className="font-black text-xs uppercase tracking-widest text-neutral-800 dark:text-neutral-100">
                📚 Documents
              </div>
              <div className="text-[10px] text-neutral-500 font-medium uppercase mt-1">
                Authorative course materials
              </div>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange("notes")}
          className={`${cardBase} ${cardTheme} ${
            category === "notes"
              ? "ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
              : ""
          }`}
        >
          <div className="flex items-center gap-4 relative z-10">
            <div
              className={`w-4 h-4 rounded-full border-4 transition-colors ${category === "notes" ? "border-emerald-500 bg-white dark:bg-black" : "border-neutral-200 dark:border-neutral-800"}`}
            />
            <div>
              <div className="font-black text-xs uppercase tracking-widest text-neutral-800 dark:text-neutral-100">
                📝 Notes
              </div>
              <div className="text-[10px] text-neutral-500 font-medium uppercase mt-1">
                Handwritten and quick study guides
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
