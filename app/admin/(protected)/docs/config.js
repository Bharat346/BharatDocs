// constants/config.js
export const DOCS_COLLECTION_ID = "9431f8a2-0ced-4458-acfa-b0e684e740a5";
export const NOTES_COLLECTION_ID = "6f1d3544-98b3-41e6-988e-fd614805c201";

export const COLLECTION_IDS = {
  docs: DOCS_COLLECTION_ID,
  notes: NOTES_COLLECTION_ID,
};

export const INITIAL_FORM_STATE = {
  collectionId: DOCS_COLLECTION_ID,
  parentId: null,
  name: "",
  slug: "",
  nodeType: "folder",
  fileType: null,
  filePath: null,
  fileSize: null,
  parentName: null,
  parentSlug: null,
  orderIndex: 0,
  isPublished: false,
  tags: [],
  category: "docs",
};

// Schema-compatible file types
export const FILE_TYPES = [
  { value: "mdx", label: "MDX" },
  { value: "pdf", label: "PDF" },
  { value: "docx", label: "DOCX" },
];

export const NODE_TYPES = {
  docs: [
    { value: "folder", label: "📁 Folder" },
    { value: "doc", label: "📄 Document" },
  ],
  notes: [
    { value: "folder", label: "📁 Folder" },
    { value: "note", label: "📝 Note" },
  ],
};