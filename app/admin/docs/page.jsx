"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useThemeContext } from "@/components/ThemeProvider";

const DOCS_COLLECTION_ID = "9431f8a2-0ced-4458-acfa-b0e684e740a5";
const NOTES_COLLECTION_ID = "6f1d3544-98b3-41e6-988e-fd614805c201";

// Move constants outside component
const INITIAL_FORM_STATE = {
  collectionId: DOCS_COLLECTION_ID,
  parentId: null,
  parentName: null,
  parentPath: "",
  name: "",
  slug: "",
  nodeType: "folder",
  fileType: null,
  filePath: null,
  fileSize: null,
  orderIndex: 0,
  isPublished: true,
  category: "docs",
};

// Memoized utility functions
const slugify = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
};

// Collection ID mapping
const COLLECTION_IDS = {
  docs: DOCS_COLLECTION_ID,
  notes: NOTES_COLLECTION_ID,
};

export default function AdminDocsPage() {
  const { theme, mounted } = useThemeContext();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [manualFilePath, setManualFilePath] = useState(false);

  // Filter folders by current collection AND nodeType (only show folders for parent selection)
  const filteredFolders = useMemo(() => {
    return folders.filter(folder => 
      folder.collectionId === COLLECTION_IDS[form.category]
    );
  }, [folders, form.category]);

  // Get available node types based on category
  const availableNodeTypes = useMemo(() => {
    const types = [
      { value: "folder", label: "📁 Folder" }
    ];
    
    if (form.category === "docs") {
      types.push({ value: "doc", label: "📄 Document" });
    } else if (form.category === "notes") {
      types.push({ value: "note", label: "📝 Note" });
    }
    
    return types;
  }, [form.category]);

  // Memoized derived values
  const isFileType = useMemo(() => form.nodeType !== "folder", [form.nodeType]);
  
  // Auto-generated file path preview
  const autoFilePathPreview = useMemo(() => {
    if (!isFileType || !form.slug || !form.fileType) return "";
    const baseFolder = form.category === "docs" ? "docs" : "notes";
    const parentPath = form.parentPath ? `${form.parentPath}/` : "";
    return `${baseFolder}/${parentPath}${form.slug}.${form.fileType}`;
  }, [isFileType, form.slug, form.fileType, form.parentPath, form.category]);

  // Final file path (auto-generated or manually entered)
  const filePathValue = useMemo(() => {
    if (manualFilePath && form.filePath) {
      return form.filePath;
    }
    return autoFilePathPreview;
  }, [manualFilePath, form.filePath, autoFilePathPreview]);

  // Calculate next order index for the selected parent
  const nextOrderIndex = useMemo(() => {
    // Filter nodes by current collection and parent
    const collectionNodes = folders.filter(node => 
      node.collectionId === COLLECTION_IDS[form.category]
    );
    
    if (form.parentId) {
      // Filter nodes by parentId and get the highest orderIndex
      const parentNodes = collectionNodes.filter(node => node.parentId === form.parentId);
      if (parentNodes.length === 0) return 0;
      
      const maxIndex = Math.max(...parentNodes.map(node => node.orderIndex));
      return maxIndex + 1;
    } else {
      // For root nodes (parentId is null)
      const rootNodes = collectionNodes.filter(node => node.parentId === null);
      if (rootNodes.length === 0) return 0;
      
      const maxIndex = Math.max(...rootNodes.map(node => node.orderIndex));
      return maxIndex + 1;
    }
  }, [folders, form.category, form.parentId]);

  /* =======================
     LOAD FOLDERS (Optimized)
  ======================= */
  useEffect(() => {
    let isMounted = true;
    
    const loadFolders = async () => {
      try {
        const response = await fetch("/api/admin/nodes");
        if (!response.ok) throw new Error("Failed to load folders");
        const data = await response.json();
        
        if (isMounted) {
          setFolders(data);
        }
      } catch (error) {
        console.error("Error loading folders:", error);
        if (isMounted) {
          setFolders([]);
        }
      }
    };

    loadFolders();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =======================
     AUTO UPDATE ORDER INDEX
     when parent changes
  ======================= */
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      orderIndex: nextOrderIndex
    }));
  }, [nextOrderIndex]);

  /* =======================
     AUTO SLUG FOR ALL NODE TYPES
     when name changes
  ======================= */
  useEffect(() => {
    if (form.name) {
      setForm(prev => ({
        ...prev,
        slug: slugify(form.name),
      }));
    }
  }, [form.name]);

  /* =======================
     AUTO UPDATE COLLECTION ID
     when category changes
  ======================= */
  useEffect(() => {
    const newCollectionId = COLLECTION_IDS[form.category];
    setForm(prev => ({
      ...prev,
      collectionId: newCollectionId,
    }));
    
    // Reset node type to folder when category changes
    if (form.nodeType !== "folder") {
      setForm(prev => ({
        ...prev,
        nodeType: "folder",
        fileType: null,
      }));
    }
  }, [form.category]);

  /* =======================
     AUTO FILE PATH (Optimized)
  ======================= */
  useEffect(() => {
    if (isFileType && form.slug && form.fileType && !manualFilePath) {
      setForm(prev => ({
        ...prev,
        filePath: autoFilePathPreview,
      }));
    }
  }, [form.slug, form.fileType, isFileType, autoFilePathPreview, manualFilePath]);

  /* =======================
     RESET FORM WHEN CATEGORY CHANGES
  ======================= */
  useEffect(() => {
    // Reset parent and node type when switching categories
    setForm(prev => ({
      ...prev,
      parentId: null,
      parentName: null,
      parentPath: "",
      // Only reset nodeType if it's not a valid option for the new category
      nodeType: form.category === "docs" && prev.nodeType === "note" ? "folder" :
                form.category === "notes" && prev.nodeType === "doc" ? "folder" :
                prev.nodeType,
    }));
    // Reset manual file path toggle when category changes
    setManualFilePath(false);
  }, [form.category]);

  /* =======================
     HANDLERS
  ======================= */
  const handleInputChange = useCallback((field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleCategoryChange = useCallback((value) => {
    setForm(prev => ({
      ...prev,
      category: value,
      collectionId: COLLECTION_IDS[value],
      // Reset node type if switching from docs to notes or vice versa
      nodeType: prev.nodeType === "doc" && value === "notes" ? "folder" :
                prev.nodeType === "note" && value === "docs" ? "folder" :
                prev.nodeType,
      fileType: null,
    }));
    setManualFilePath(false);
  }, []);

  const handleNodeTypeChange = useCallback((value) => {
    setForm(prev => ({
      ...prev,
      nodeType: value,
      fileType: value === "folder" ? null : "mdx", // Default to mdx for files
    }));
  }, []);

  const handleParentChange = useCallback((value) => {
    const selectedFolder = filteredFolders.find(f => f.id === value);
    setForm(prev => ({
      ...prev,
      parentId: selectedFolder?.id ?? null,
      parentName: selectedFolder?.name ?? null,
      parentPath: selectedFolder?.path ?? "",
    }));
  }, [filteredFolders]);

  const handleManualOrderChange = useCallback((value) => {
    const newOrder = parseInt(value, 10);
    if (!isNaN(newOrder) && newOrder >= 0) {
      handleInputChange("orderIndex", newOrder);
    }
  }, [handleInputChange]);

  const toggleManualFilePath = useCallback(() => {
    setManualFilePath(!manualFilePath);
    if (!manualFilePath) {
      // When enabling manual mode, copy auto-generated path as starting point
      setForm(prev => ({
        ...prev,
        filePath: autoFilePathPreview,
      }));
    } else {
      // When disabling manual mode, reset to auto-generated
      setForm(prev => ({
        ...prev,
        filePath: null,
      }));
    }
  }, [manualFilePath, autoFilePathPreview]);

  /* =======================
     SUBMIT (Optimized)
  ======================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.name.trim()) {
      alert("Please enter a name");
      return;
    }

    if (isFileType && !form.fileType) {
      alert("Please select a file type");
      return;
    }

    // Validate slug for non-folder nodes
    if (isFileType && !form.slug.trim()) {
      alert("Slug cannot be empty for files");
      return;
    }

    // Validate file path for files
    if (isFileType && !filePathValue.trim()) {
      alert("File path cannot be empty");
      return;
    }

    // Validate node type for category
    if (form.category === "docs" && form.nodeType === "note") {
      alert("Cannot create 'note' type in Documents collection. Please select 'doc' or 'folder'.");
      return;
    }
    
    if (form.category === "notes" && form.nodeType === "doc") {
      alert("Cannot create 'doc' type in Notes collection. Please select 'note' or 'folder'.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        collectionId: form.collectionId,
        parentId: form.parentId,
        parentName: form.parentName,
        name: form.name.trim(),
        slug: form.slug.trim(),
        nodeType: form.nodeType,
        fileType: isFileType ? form.fileType : null,
        filePath: isFileType ? filePathValue : null,
        fileSize: isFileType ? form.fileSize : null,
        orderIndex: form.orderIndex,
        isPublished: form.isPublished,
      };

      console.log("Submitting payload:", payload);

      const response = await fetch("/api/admin/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create node: ${errorText}`);
      }

      alert("Node created successfully");
      
      // Refresh folders to get updated order indices
      const refreshResponse = await fetch("/api/admin/nodes");
      if (refreshResponse.ok) {
        const updatedFolders = await refreshResponse.json();
        setFolders(updatedFolders);
      }
      
      // Reset form but keep current category
      setForm({
        ...INITIAL_FORM_STATE,
        category: form.category,
        collectionId: COLLECTION_IDS[form.category],
        orderIndex: nextOrderIndex,
      });
      setManualFilePath(false);

    } catch (error) {
      console.error("Error creating node:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Don't render until theme is mounted to avoid hydration issues
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
    dark: "bg-gradient-to-br from-gray-900 to-black border-gray-800 text-white",
  };

  const inputClasses = `w-full mt-1 px-4 py-2 rounded-lg border transition-colors ${
    theme === 'dark' 
      ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
  }`;

  const cardClasses = `px-3 py-2 rounded-lg border transition-all duration-200 ${
    theme === 'dark' 
      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
  }`;

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className={`max-w-2xl mx-auto rounded-xl border p-6 space-y-6 shadow-lg ${themeClasses[theme]}`}>
        <header>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
            Create Node
          </h2>
          <p className="text-sm opacity-75">
            Create a new folder, document, or note in your collection
          </p>
          <div className={`mt-2 px-3 py-1 rounded-full text-xs inline-flex items-center gap-1 ${
            form.category === "docs" 
              ? theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
              : theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              form.category === "docs" ? 'bg-blue-500' : 'bg-green-500'
            }`}></div>
            Currently creating in: <span className="font-medium capitalize">{form.category}</span> collection
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleCategoryChange("docs")}
                className={`${cardClasses} text-left ${
                  form.category === "docs"
                    ? theme === 'dark'
                      ? 'ring-2 ring-blue-500 bg-blue-900/20'
                      : 'ring-2 ring-blue-500 bg-blue-50'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${form.category === "docs" ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                  <div>
                    <div className="font-medium">📚 Documents</div>
                    <div className="text-xs opacity-75 mt-1">
                      Create folders and documents (.mdx, .pdf, etc.)
                    </div>
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => handleCategoryChange("notes")}
                className={`${cardClasses} text-left ${
                  form.category === "notes"
                    ? theme === 'dark'
                      ? 'ring-2 ring-green-500 bg-green-900/20'
                      : 'ring-2 ring-green-500 bg-green-50'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${form.category === "notes" ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div>
                    <div className="font-medium">📝 Notes</div>
                    <div className="text-xs opacity-75 mt-1">
                      Create folders and notes (.mdx, .txt, .json, etc.)
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="space-y-5">
            <h3 className="text-lg font-medium border-b pb-2">
              Basic Information
            </h3>
            
            {/* NAME */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Name *
              </label>
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
              <label className="block text-sm font-medium mb-1">
                Slug
              </label>
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
                    : "Optional for folders. Auto-generated from name."
                  }
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
                  {availableNodeTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs opacity-75 mt-1">
                  {form.category === "docs" 
                    ? "Documents collection supports: Folders and Documents"
                    : "Notes collection supports: Folders and Notes"
                  }
                </p>
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
                  {filteredFolders.length === 0 ? (
                    <option disabled value="">
                      No folders available in {form.category} collection
                    </option>
                  ) : (
                    filteredFolders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))
                  )}
                </select>
                {filteredFolders.length === 0 ? (
                  <p className="text-xs opacity-75 mt-1">
                    No folders exist in the {form.category} collection yet. This will be created at the root level.
                  </p>
                ) : (
                  <p className="text-xs opacity-75 mt-1">
                    {filteredFolders.length} folder{filteredFolders.length !== 1 ? 's' : ''} available in {form.category} collection
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* File Configuration Section */}
          {isFileType && (
            <div className="space-y-5">
              <h3 className="text-lg font-medium border-b pb-2">
                File Configuration
              </h3>
              
              {/* File Type and Size Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    File Type *
                  </label>
                  <select
                    className={inputClasses}
                    value={form.fileType || ""}
                    onChange={(e) => handleInputChange("fileType", e.target.value)}
                    disabled={loading}
                    required={isFileType}
                  >
                    <option value="">Select type</option>
                    <option value="mdx">MDX</option>
                    <option value="pdf">PDF</option>
                    <option value="docx">DOCX</option>
                    <option value="txt">TXT</option>
                    <option value="json">JSON</option>
                    <option value="md">Markdown (.md)</option>
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
                    onChange={(e) => handleInputChange("fileSize", Number(e.target.value) || null)}
                    placeholder="Optional (e.g., 2048)"
                    disabled={loading}
                    min="0"
                  />
                  <p className="text-xs opacity-75 mt-1">
                    Leave empty for auto-calculation
                  </p>
                </div>
              </div>

              {/* FILE PATH */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">
                    File Path *
                  </label>
                  <button
                    type="button"
                    onClick={toggleManualFilePath}
                    className={`text-xs px-2 py-1 rounded ${
                      manualFilePath
                        ? theme === 'dark'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-yellow-500 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-200 text-gray-700'
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
                        onChange={(e) => handleInputChange("filePath", e.target.value)}
                        placeholder="Enter full file path (e.g., docs/folder/my-file.mdx)"
                        disabled={loading}
                        required
                      />
                      <p className="text-xs text-yellow-600">
                        ⚠️ Manual mode: You are responsible for providing the correct file path
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
                    <div className={`${cardClasses} text-xs`}>
                      <div className="font-medium mb-1">Auto-generated path would be:</div>
                      <div className="font-mono text-xs opacity-75 bg-black/20 p-1 rounded">
                        {autoFilePathPreview}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange("filePath", autoFilePathPreview);
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
          )}

          {/* Settings Section */}
          <div className="space-y-5">
            <h3 className="text-lg font-medium border-b pb-2">
              Settings
            </h3>
            
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
                    <div className={`w-2 h-2 rounded-full ${
                      form.orderIndex === nextOrderIndex 
                        ? 'bg-green-500' 
                        : 'bg-yellow-500'
                    }`}></div>
                    <span className="opacity-75">
                      {form.orderIndex === nextOrderIndex 
                        ? `Auto-calculated position (${form.orderIndex})`
                        : `Manually set to ${form.orderIndex} (Auto suggests ${nextOrderIndex})`
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* PUBLISH TOGGLE */}
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className={`w-4 h-4 rounded ${theme === 'dark' ? 'accent-blue-500' : ''}`}
                    checked={form.isPublished}
                    onChange={(e) => handleInputChange("isPublished", e.target.checked)}
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
          <div className={`${cardClasses}`}>
            <h4 className="font-medium mb-2">Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="opacity-75">Collection:</span>
                <span className="font-medium capitalize">{form.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Node Type:</span>
                <span className="font-medium capitalize">
                  {form.nodeType === "doc" ? "Document" : 
                   form.nodeType === "note" ? "Note" : 
                   "Folder"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Location:</span>
                <span className="font-medium">
                  {form.parentName ? `Inside "${form.parentName}"` : "Root Level"}
                </span>
              </div>
              {isFileType && (
                <>
                  <div className="flex justify-between">
                    <span className="opacity-75">File Type:</span>
                    <span className="font-medium uppercase">{form.fileType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">File Path Mode:</span>
                    <span className={`font-medium ${manualFilePath ? 'text-yellow-600' : 'text-green-600'}`}>
                      {manualFilePath ? "Manual" : "Auto"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">File Path:</span>
                    <span className="font-medium font-mono text-xs break-all text-right max-w-[60%]">
                      {filePathValue}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="opacity-75">Order:</span>
                <span className="font-medium">{form.orderIndex}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Status:</span>
                <span className={`font-medium ${form.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>
                  {form.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : form.category === "docs"
                  ? theme === 'dark'
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                  : theme === 'dark'
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