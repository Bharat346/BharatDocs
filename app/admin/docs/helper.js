// utils/helpers.js
export const slugify = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
};

export const validateFormData = (formData, isFileType) => {
  const errors = [];

  if (!formData.name.trim()) {
    errors.push("Name is required");
  }

  if (isFileType) {
    if (!formData.fileType) {
      errors.push("File type is required for files");
    }
    if (!formData.filePath?.trim()) {
      errors.push("File path is required for files");
    }
    if (formData.fileSize && formData.fileSize > 31457280) {
      errors.push("File size cannot exceed 30MB");
    }
  }

  // Validate node type against category
  if (formData.category === "docs" && formData.nodeType === "note") {
    errors.push("Cannot create 'note' type in Documents collection");
  }
  if (formData.category === "notes" && formData.nodeType === "doc") {
    errors.push("Cannot create 'doc' type in Notes collection");
  }

  return errors;
};

export const generateFilePath = (formData) => {
  if (!formData.nodeType || formData.nodeType === "folder") return "";
  
  const baseFolder = formData.category === "docs" ? "docs" : "notes";
  const parentSlug = formData.parentSlug ? `${formData.parentSlug}/` : "";
  const slug = formData.slug || slugify(formData.name);
  
  return `${baseFolder}/${parentSlug}${slug}.${formData.fileType}`;
};