// components/admin/FileConfiguration.jsx
import { FILE_TYPES } from "@/app/admin/(protected)/docs/config";

export const FileConfiguration = ({
  form,
  isFileType,
  manualFilePath,
  filePathValue,
  autoFilePathPreview,
  onInputChange,
  onToggleManualFilePath,
  theme,
  loading,
}) => {
  const inputClasses = `w-full mt-1 px-4 py-2 rounded-lg border transition-colors ${
    theme === "dark"
      ? "bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
  }`;

  if (!isFileType) return null;

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-medium border-b pb-2">File Configuration</h3>

      {/* File Type and Size Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">File Type *</label>
          <select
            className={inputClasses}
            value={form.fileType || ""}
            onChange={(e) => onInputChange("fileType", e.target.value)}
            disabled={loading}
            required={isFileType}
          >
            <option value="">Select type</option>
            {FILE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            File Size (bytes)
          </label>
          <input
            type="number"
            className={inputClasses}
            value={form.fileSize ?? ""}
            onChange={(e) =>
              onInputChange("fileSize", Number(e.target.value) || null)
            }
            placeholder="Optional (e.g., 2048)"
            disabled={loading}
            min="0"
            max="31457280"
          />
          <p className="text-xs opacity-75 mt-1">
            Maximum 30MB (30,000,000 bytes)
          </p>
        </div>
      </div>

      {/* FILE PATH */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">File Path *</label>
          <button
            type="button"
            onClick={onToggleManualFilePath}
            className={`text-xs px-2 py-1 rounded ${
              manualFilePath
                ? theme === "dark"
                  ? "bg-yellow-600 text-white"
                  : "bg-yellow-500 text-white"
                : theme === "dark"
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-200 text-gray-700"
            }`}
          >
            {manualFilePath ? "✏️ Manual Mode" : "🔄 Auto Mode"}
          </button>
        </div>

        <div className="space-y-3">
          {manualFilePath ? (
            <div className="space-y-2">
              <input
                className={`${inputClasses} font-mono text-sm`}
                value={form.filePath || ""}
                onChange={(e) => onInputChange("filePath", e.target.value)}
                placeholder="Enter full file path (e.g., docs/folder/my-file.mdx)"
                disabled={loading}
                required
              />
              <p className="text-xs text-yellow-600">
                ⚠️ Manual mode: You are responsible for providing the correct
                file path
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                className={`${inputClasses} bg-opacity-50 font-mono text-sm`}
                disabled
                value={filePathValue}
                placeholder="Path will be generated automatically"
              />
              <p className="text-xs opacity-75">
                Auto-generated path based on your selections
              </p>
            </div>
          )}

          {/* Preview of auto-generated path */}
          {manualFilePath && (
            <div
              className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              } text-xs`}
            >
              <div className="font-medium mb-1">
                Auto-generated path would be:
              </div>
              <div className="font-mono text-xs opacity-75 bg-black/20 p-1 rounded">
                {autoFilePathPreview}
              </div>
              <button
                type="button"
                onClick={() => {
                  onInputChange("filePath", autoFilePathPreview);
                }}
                className="mt-2 text-blue-500 hover:text-blue-600 text-xs"
              >
                Click here to use auto-generated path
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
