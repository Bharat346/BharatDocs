// src/components/NotesManager/FolderItem.jsx
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Edit, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FolderItem = ({ folder, onClick, isSelected, onSelect, isDark, onDelete, onEdit }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e) => {
    // If holding Ctrl or Cmd, add to selection
    if (e.ctrlKey || e.metaKey) {
      onSelect(folder, !isSelected);
    } else {
      onClick();
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(false);
    onDelete(folder);
  };

  return (
    <>
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`p-4 rounded-lg cursor-pointer transition-colors relative ${
          isSelected
            ? isDark
              ? "bg-blue-900"
              : "bg-blue-200"
            : isDark
            ? "hover:bg-gray-700"
            : "hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center">
          <Folder className={`w-8 h-8 mr-3 ${
            isDark ? "text-yellow-400" : "text-yellow-600"
          }`} />
          <div className="flex-1">
            <h3 className="font-medium">{folder.title}</h3>
            <p
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {folder.children?.length || 0} files,{" "}
              {Object.keys(folder.subfolders || {}).length} folders
            </p>
          </div>
          {(isHovered || isSelected) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-1 rounded-full ${
                    isDark ? "hover:bg-gray-600" : "hover:bg-gray-200"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEdit(folder);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder "{folder.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this folder and all its contents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FolderItem;