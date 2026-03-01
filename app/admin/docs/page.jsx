// app/admin/docs/page.jsx
"use client";

import { useThemeContext } from "@/components/ThemeProvider";
import { useNodeForm } from "@/hooks/useNodeForm";
import { CategorySelector } from "@/components/admin/CategorySelector";
import { FileConfiguration } from "@/components/admin/FileConfiguration";
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

  // Theme-based styles
  const themeClasses = {
    light: "bg-white border-gray-200 text-gray-900",
    dark: "bg-neutral-950 border-gray-800 text-white",
  };

  const inputClasses = `w-full mt-1 px-4 py-2 rounded-lg border transition-colors ${
    theme === "dark"
      ? "bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
  }`;

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div
        className={`max-w-2xl mx-auto rounded-xl border p-6 space-y-6 shadow-lg ${themeClasses[theme]}`}
      >
        <header>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
            Create Node
          </h2>
          <p className="text-sm opacity-75">
            Create a new folder, document, or note in your collection
          </p>
          <div
            className={`mt-2 px-3 py-1 rounded-full text-xs inline-flex items-center gap-1 ${
              form.category === "docs"
                ? theme === "dark"
                  ? "bg-blue-900/30 text-blue-300"
                  : "bg-blue-100 text-blue-700"
                : theme === "dark"
                  ? "bg-green-900/30 text-green-300"
                  : "bg-green-100 text-green-700"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                form.category === "docs" ? "bg-blue-500" : "bg-green-500"
              }`}
            ></div>
            Currently creating in:{" "}
            <span className="font-medium capitalize">{form.category}</span>{" "}
            collection
          </div>
        </header>

        {/* {errors.length > 0 && <ErrorAlert errors={errors} theme={theme} />} */}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <CategorySelector
            category={form.category}
            onChange={handleCategoryChange}
            theme={theme}
          />

          {/* Basic Information Section */}
          <div className="space-y-5">
            <h3 className="text-lg font-medium border-b pb-2">
              Basic Information
            </h3>

            {/* NAME */}
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                className={inputClasses}
                placeholder="Enter node name"
                value={form.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* SLUG */}
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <div className="space-y-2">
                <input
                  className={inputClasses}
                  placeholder="Auto-generated from name"
                  value={form.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  disabled={loading}
                  required={isFileType}
                />
                <p className="text-xs opacity-75">
                  {isFileType
                    ? "Required for files. Auto-generated from name."
                    : "Optional for folders. Auto-generated from name."}
                </p>
              </div>
            </div>

            {/* TYPE and PARENT Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* TYPE */}
              <div>
                <label className="block text-sm font-medium mb-1">
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

              {/* PARENT */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Parent Folder
                </label>
                <select
                  className={inputClasses}
                  value={form.parentId ?? ""}
                  onChange={(e) => handleParentChange(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Root (No Parent)</option>
                  {folders.length === 0 ? (
                    <option disabled value="">
                      No folders available in {form.category} collection
                    </option>
                  ) : (
                    folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))
                  )}
                </select>
                {folders.length === 0 ? (
                  <p className="text-xs opacity-75 mt-1">
                    No folders exist in the {form.category} collection yet. This
                    will be created at the root level.
                  </p>
                ) : (
                  <p className="text-xs opacity-75 mt-1">
                    {folders.length} folder{folders.length !== 1 ? "s" : ""}{" "}
                    available in {form.category} collection
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* File Configuration */}
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

          {/* Settings Section */}
          <div className="space-y-5">
            <h3 className="text-lg font-medium border-b pb-2">Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ORDER */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Order Index
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    className={inputClasses}
                    value={form.orderIndex}
                    onChange={(e) => handleManualOrderChange(e.target.value)}
                    disabled={loading}
                    min="0"
                    step="1"
                  />
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        form.orderIndex === nextOrderIndex
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    ></div>
                    <span className="opacity-75">
                      {form.orderIndex === nextOrderIndex
                        ? `Auto-calculated position (${form.orderIndex})`
                        : `Manually set to ${form.orderIndex} (Auto suggests ${nextOrderIndex})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* PUBLISH TOGGLE */}
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className={`w-4 h-4 rounded ${theme === "dark" ? "accent-blue-500" : ""}`}
                    checked={form.isPublished}
                    onChange={(e) =>
                      handleInputChange("isPublished", e.target.checked)
                    }
                    disabled={loading}
                  />
                  <div>
                    <span className="font-medium">Published</span>
                    <p className="text-xs opacity-75 mt-1">
                      {form.isPublished
                        ? "Visible to users"
                        : "Hidden from users"}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          {/* <SummaryPanel form={form} isFileType={isFileType} manualFilePath={manualFilePath} filePathValue={filePathValue} theme={theme} /> */}

          {/* SUBMIT BUTTON */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : form.category === "docs"
                    ? theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                    : theme === "dark"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </span>
              ) : (
                `Create ${form.category === "docs" ? "Document" : "Note"} ${form.nodeType === "folder" ? "Folder" : "File"}`
              )}
            </button>

            {loading && (
              <p className="mt-2 text-sm text-center opacity-75">
                Creating {form.nodeType} in {form.category} collection...
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
