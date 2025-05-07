// src/components/NotesManager/notesUtils.js
export const validateNoteItem = (item) => {
    if (!item) return false;
    
    if (item.type === 'Folder') {
      return (
        typeof item.title === 'string' &&
        typeof item.baseName === 'string' &&
        Array.isArray(item.children) &&
        typeof item.subfolders === 'object' &&
        item.subfolders !== null
      );
    } else if (item.type === 'File') {
      return (
        typeof item.name === 'string' &&
        typeof item.url === 'string' &&
        typeof item.format === 'string'
      );
    }
    
    return false;
  };
  
  export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };
  
  export const findItemInData = (data, path) => {
    let current = data;
    for (const segment of path) {
      if (current.subfolders && current.subfolders[segment]) {
        current = current.subfolders[segment];
      } else {
        return null;
      }
    }
    return current;
  };