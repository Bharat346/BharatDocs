// app/admin/docs/page.jsx
"use client";

import { useThemeContext } from "@/components/ThemeProvider";
import { useNodeForm } from "@/hooks/useNodeForm";
import { CategorySelector } from "@/components/admin/CategorySelector";
import { FileConfiguration } from "@/components/admin/FileConfiguration";
import { Loader2 } from "lucide-react";
// import { SummaryPanel } from "@/components/admin/SummaryPanel";

export default function AdminDocsPage() {
  const { theme, mounted } = useThemeContext();

  const {
    form,
    folders,
    loading,
    manualFilePath,
    errors,
    isFileType,
    availableNodeTypes,
    filePathValue,
    autoFilePathPreview,
    nextOrderIndex,
    handleInputChange,
    handleCategoryChange,
    handleNodeTypeChange,
    handleParentChange,
    handleManualOrderChange,
    toggleManualFilePath,
    handleSubmit,
  } = useNodeForm();

  // Don't render until theme is mounted
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  // Theme-based styles for complex dynamic colors (if any)
  const inputBase =
    "w-full mt-1 px-4 py-2 rounded-lg border transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/50";
  const inputThemes =
    "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus:border-blue-500 dark:focus:border-blue-400";
  const inputClasses = `${inputBase} ${inputThemes}`;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-transparent">
      <div className="max-w-3xl mx-auto bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 md:p-10 space-y-8 shadow-sm transition-colors">
        <header className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-black tracking-tight mb-2 text-neutral-800 dark:text-neutral-100 uppercase tracking-widest">
              Create Node
            </h2>
            <p className="text-sm text-neutral-500 font-medium">
              Structure your documentation categories and files
            </p>

            <div
              className={`mt-4 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 border ${
                form.category === "docs"
                  ? "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30 text-blue-600 dark:text-blue-400"
                  : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${form.category === "docs" ? "bg-blue-500" : "bg-emerald-500"}`}
              />
              Collection: <span className="font-black">{form.category}</span>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          <CategorySelector
            category={form.category}
            onChange={handleCategoryChange}
            theme={theme}
          />

          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">
                  Node Name *
                </label>
                <input
                  className={inputClasses}
                  placeholder="e.g. Introduction to React"
                  value={form.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">
                  Slug
                </label>
                <input
                  className={inputClasses}
                  placeholder="auto-generated-slug"
                  value={form.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  disabled={loading}
                  required={isFileType}
                />
              </div>

              <div className="flex flex-col justify-end pb-1">
                <p className="text-[10px] text-neutral-400 italic font-medium">
                  {isFileType
                    ? "Required for files. Auto-generated from name."
                    : "Optional for folders. Auto-generated from name."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">
                  Node Type
                </label>
                <select
                  className={inputClasses}
                  value={form.nodeType}
                  onChange={(e) => handleNodeTypeChange(e.target.value)}
                  disabled={loading}
                >
                  {availableNodeTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">
                  Parent Folder
                </label>
                <select
                  className={inputClasses}
                  value={form.parentId ?? ""}
                  onChange={(e) => handleParentChange(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Root (No Parent)</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">
                  Tags (Comma separated)
                </label>
                <input
                  className={inputClasses}
                  placeholder="e.g. react, hooks, advanced"
                  value={form.tags.join(", ")}
                  onChange={(e) => {
                    const val = e.target.value;
                    const tagsArray = val.split(",").map(t => t.trim()).filter(t => t !== "");
                    handleInputChange("tags", tagsArray);
                  }}
                  disabled={loading}
                />
            </div>
          </div>

          <FileConfiguration
            form={form}
            isFileType={isFileType}
            manualFilePath={manualFilePath}
            filePathValue={filePathValue}
            autoFilePathPreview={autoFilePathPreview}
            onInputChange={handleInputChange}
            onToggleManualFilePath={toggleManualFilePath}
            theme={theme}
            loading={loading}
          />

          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">
                  Order Index
                </label>
                <input
                  type="number"
                  className={inputClasses}
                  value={form.orderIndex}
                  onChange={(e) => handleManualOrderChange(e.target.value)}
                  disabled={loading}
                  min="0"
                />
                <p className="mt-2 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  Suggests: {nextOrderIndex}
                </p>
              </div>

              <div className="flex items-center h-full pt-6">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.isPublished}
                      onChange={(e) =>
                        handleInputChange("isPublished", e.target.checked)
                      }
                      disabled={loading}
                    />
                    <div
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${form.isPublished ? "bg-blue-600" : "bg-neutral-300 dark:bg-neutral-700"}`}
                    />
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${form.isPublished ? "translate-x-6" : "translate-x-0"}`}
                    />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200 group-hover:text-blue-600 transition-colors">
                      Visible to Users
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 px-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 shadow-xl active:scale-95 ${
                loading
                  ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                  : "bg-neutral-800 dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-100"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </span>
              ) : (
                `Create ${form.nodeType} Node`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
