// hooks/useNodeForm.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  INITIAL_FORM_STATE, 
  COLLECTION_IDS, 
  FILE_TYPES,
  NODE_TYPES 
} from "@/app/admin/docs/config";
import { slugify, generateFilePath, validateFormData } from "@/app/admin/docs/helper";

export const useNodeForm = () => {
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualFilePath, setManualFilePath] = useState(false);
  const [errors, setErrors] = useState([]);

  // Filter folders by current collection AND nodeType (only show folders for parent selection)
  const filteredFolders = useMemo(() => {
    return folders.filter(folder => 
      folder.collectionId === COLLECTION_IDS[form.category] && 
      folder.nodeType === "folder"
    );
  }, [folders, form.category]);

  // Get available node types based on category
  const availableNodeTypes = useMemo(() => {
    return NODE_TYPES[form.category] || NODE_TYPES.docs;
  }, [form.category]);

  // Memoized derived values
  const isFileType = useMemo(() => form.nodeType !== "folder", [form.nodeType]);
  
  // Auto-generated file path preview
  const autoFilePathPreview = useMemo(() => {
    return generateFilePath(form);
  }, [form]);

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
     LOAD FOLDERS
  ======================= */
  const loadFolders = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/nodes");
      if (!response.ok) throw new Error("Failed to load folders");
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error("Error loading folders:", error);
      setFolders([]);
    }
  }, []);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  /* =======================
     AUTO UPDATE ORDER INDEX
  ======================= */
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      orderIndex: nextOrderIndex
    }));
  }, [nextOrderIndex]);

  /* =======================
     AUTO SLUG FOR ALL NODE TYPES
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
  ======================= */
  useEffect(() => {
    const newCollectionId = COLLECTION_IDS[form.category];
    setForm(prev => ({
      ...prev,
      collectionId: newCollectionId,
    }));
  }, [form.category]);

  /* =======================
     AUTO FILE PATH
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
      nodeType: "folder",
      fileType: null,
    }));
    setManualFilePath(false);
    setErrors([]);
  }, []);

  const handleNodeTypeChange = useCallback((value) => {
    setForm(prev => ({
      ...prev,
      nodeType: value,
      fileType: value === "folder" ? null : "mdx",
    }));
    setErrors([]);
  }, []);

  const handleParentChange = useCallback((value) => {
    const selectedFolder = filteredFolders.find(f => f.id === value);
    setForm(prev => ({
      ...prev,
      parentId: selectedFolder?.id ?? null,
      parentName: selectedFolder?.name ?? null,
      parentSlug: selectedFolder?.slug ?? null,
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
      setForm(prev => ({
        ...prev,
        filePath: autoFilePathPreview,
      }));
    } else {
      setForm(prev => ({
        ...prev,
        filePath: null,
      }));
    }
  }, [manualFilePath, autoFilePathPreview]);

  /* =======================
     SUBMIT
  ======================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateFormData(form, isFileType);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const payload = {
        collectionId: form.collectionId,
        parentId: form.parentId,
        name: form.name.trim(),
        slug: form.slug.trim(),
        nodeType: form.nodeType,
        fileType: isFileType ? form.fileType : null,
        filePath: isFileType ? filePathValue : null,
        fileSize: isFileType ? form.fileSize || 0 : null,
        parentName: form.parentName,
        parentSlug: form.parentSlug,
        orderIndex: form.orderIndex,
        isPublished: form.isPublished,
      };

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
      
      // Refresh folders
      await loadFolders();
      
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
      setErrors([error.message]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM_STATE);
    setManualFilePath(false);
    setErrors([]);
  }, []);

  return {
    form,
    folders: filteredFolders,
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
    resetForm,
  };
};