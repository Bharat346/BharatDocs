// src/components/NotesManager/NotesBrowser.jsx
import FileItem from "./FileItem";
import FolderItem from "./FolderItem";
import { toast } from "react-hot-toast";
import { deleteNoteItem, updateNotesData } from "@/api/notesApi";

const NotesBrowser = ({
  folder,
  onFolderClick,
  selectedItems,
  onSelectItems,
  isDark,
  currentPath,
  refreshFolder,
}) => {
  if (!folder) return <div>Folder not found</div>;

  const handleItemSelect = (item, isSelected) => {
    if (isSelected) {
      onSelectItems([...selectedItems, item]);
    } else {
      onSelectItems(
        selectedItems.filter(
          (selected) =>
            (selected.type === "Folder" &&
              item.type === "Folder" &&
              selected.baseName === item.baseName) ||
            (selected.type === "File" &&
              item.type === "File" &&
              selected.name === item.name)
        )
      );
    }
  };

  const handleDeleteItem = async (item) => {
    try {
      await deleteNoteItem(currentPath.join('/'), item);
      toast.success(`${item.type === 'Folder' ? 'Folder' : 'File'} deleted successfully`);
      refreshFolder();
    } catch (error) {
      toast.error(`Failed to delete: ${error.message}`);
    }
  };

  const handleEditItem = async (item, newName) => {
    try {
      const updatedFolder = { ...folder };
      
      if (item.type === 'Folder') {
        if (updatedFolder.subfolders[item.baseName]) {
          const folderData = updatedFolder.subfolders[item.baseName];
          delete updatedFolder.subfolders[item.baseName];
          updatedFolder.subfolders[newName] = {
            ...folderData,
            title: newName,
            baseName: newName
          };
        }
      } else {
        updatedFolder.children = updatedFolder.children.map(child => 
          child.name === item.name ? { ...child, name: newName } : child
        );
      }

      await updateNotesData(currentPath.join('/'), updatedFolder);
      toast.success(`${item.type === 'Folder' ? 'Folder' : 'File'} renamed successfully`);
      refreshFolder();
    } catch (error) {
      toast.error(`Failed to rename: ${error.message}`);
    }
  };

  return (
    <div className={`mt-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
      <h2 className="text-xl font-bold mb-4">{folder.title}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(folder.subfolders || {}).map(([name, subfolder]) => (
          <FolderItem
            key={name}
            folder={subfolder}
            onClick={() => onFolderClick(name)}
            isSelected={selectedItems.some(
              (item) => item.type === "Folder" && item.baseName === name
            )}
            onSelect={handleItemSelect}
            isDark={isDark}
            onDelete={handleDeleteItem}
            onEdit={(folder) => {
              const newName = prompt("Enter new folder name:", folder.title);
              if (newName && newName !== folder.title) {
                handleEditItem(folder, newName);
              }
            }}
          />
        ))}

        {(folder.children || []).map((file, index) => (
          <FileItem
            key={`${file.name}-${index}`}
            file={file}
            isSelected={selectedItems.some(
              (item) => item.type === "File" && item.name === file.name
            )}
            onSelect={handleItemSelect}
            isDark={isDark}
            onDelete={handleDeleteItem}
            onEdit={(file) => {
              const newName = prompt("Enter new file name:", file.name);
              if (newName && newName !== file.name) {
                handleEditItem(file, newName);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default NotesBrowser;