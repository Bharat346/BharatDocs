// src/components/NotesManager/FileItem.jsx
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
import { MoreVertical, Trash2, Edit, File, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FileItem = ({ file, isSelected, onSelect, isDark, onDelete, onEdit }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getFileIcon = (format) => {
    const iconClass = `w-6 h-6 mr-2 ${
      isDark ? "text-blue-300" : "text-blue-600"
    }`;

    switch (format) {
      case "pdf":
        return <FileText className={iconClass} />;
      case "xlsx":
        return <FileText className={iconClass} />;
      case "pptx":
        return <FileText className={iconClass} />;
      default:
        return <File className={iconClass} />;
    }
  };

  const handleClick = (e) => {
    if (e.ctrlKey || e.metaKey) {
      onSelect(file, !isSelected);
    } else {
      window.open(file.url, "_blank");
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(false);
    onDelete(file);
  };

  return (
    <>
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`p-3 rounded-lg cursor-pointer transition-colors relative ${
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
          {getFileIcon(file.format)}
          <div className="flex-1">
            <h3 className="font-medium">{file.name}</h3>
            <p
              className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {file.format.toUpperCase()} file
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
                  onEdit(file);
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
            <AlertDialogTitle>Delete file "{file.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this file.
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

export default FileItem;