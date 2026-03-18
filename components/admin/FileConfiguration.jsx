import { FILE_TYPES } from "@/app/admin/(protected)/docs/config";

export const FileConfiguration = ({
  form,
  isFileType,
  manualFilePath,
  filePathValue,
  autoFilePathPreview,
  onInputChange,
  onToggleManualFilePath,
  loading,
}) => {
  const inputBase =
    "w-full mt-2 px-4 py-2.5 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm";
  const inputTheme =
    "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus:border-blue-500";
  const inputClasses = `${inputBase} ${inputTheme}`;

  if (!isFileType) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
        File Configuration
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500">
            File Format *
          </label>
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
          <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500">
            File Size (Bytes)
          </label>
          <input
            type="number"
            className={inputClasses}
            value={form.fileSize ?? ""}
            onChange={(e) =>
              onInputChange("fileSize", Number(e.target.value) || null)
            }
            placeholder="e.g. 2048"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500">
            Resource Path *
          </label>
          <button
            type="button"
            onClick={onToggleManualFilePath}
            className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest transition-all ${
              manualFilePath
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 border border-amber-200 dark:border-amber-800"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-200 dark:border-neutral-700"
            }`}
          >
            {manualFilePath ? "Manual Mode" : "Auto Mode"}
          </button>
        </div>

        <div className="space-y-4">
          {manualFilePath ? (
            <div className="space-y-2">
              <input
                className={`${inputClasses} font-mono`}
                value={form.filePath || ""}
                onChange={(e) => onInputChange("filePath", e.target.value)}
                placeholder="docs/path/to/file.mdx"
                disabled={loading}
                required
              />
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider italic">
                ⚠️ Careful: Direct path entry enabled
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                className={`${inputClasses} bg-neutral-50 dark:bg-neutral-900/30 opacity-60 font-mono`}
                disabled
                value={filePathValue}
                placeholder="Path generated based on slugs"
              />
            </div>
          )}

          {manualFilePath && (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
              <div className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-2">
                Suggested System Path:
              </div>
              <div className="font-mono text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 break-all">
                {autoFilePathPreview}
              </div>
              <button
                type="button"
                onClick={() => onInputChange("filePath", autoFilePathPreview)}
                className="mt-3 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
              >
                Apply suggestion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
