import React, { useState, useEffect, useRef, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { nanoid } from "nanoid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast, ToastContainer } from "react-toastify";
import { Trash2, Pencil, Plus, GripVertical, Save } from "lucide-react";
import { createGitHubFileManager } from "@/lib/github_file_manager";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const DraggableSubLink = ({ index, title, url, moveSubLink, updateSubLinkUrl, requestDelete }) => {
  const ref = useRef(null);
  const [{ isDragging }, drag] = useDrag({
    type: "subLink",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const [, drop] = useDrop({
    accept: "subLink",
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveSubLink(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });
  drag(drop(ref));

  return (
    <li 
      ref={ref} 
      className="flex items-center justify-between p-2 border rounded-md mb-2 bg-white dark:bg-gray-800 shadow-sm dark:border-gray-700"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <span className="flex items-center gap-2 dark:text-white">
        <GripVertical className="cursor-move text-gray-500 dark:text-gray-400" size={16} />
        {title}
      </span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => updateSubLinkUrl(index)}>
          <Pencil size={14} className="dark:text-white" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="destructive">
              <Trash2 size={14} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="dark:text-white">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="dark:text-gray-400">
                This action cannot be undone. This will permanently delete the sub-link.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-800">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => requestDelete(index)}
                className="dark:bg-red-600 dark:hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
};

const BlogMetaManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [subLinks, setSubLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER;
  const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO;
  const GITHUB_BRANCH = import.meta.env.VITE_GITHUB_BRANCH;
  const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

  const githubFileManager = createGitHubFileManager(
    GITHUB_TOKEN,
    GITHUB_OWNER,
    GITHUB_REPO
  );

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const content = await githubFileManager.getFile("blogs.json", GITHUB_BRANCH);
        const data = JSON.parse(content);
        setBlogs(data || []);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast.error("Failed to load blog list");
        if (error.message.includes("File not found")) {
          await githubFileManager.uploadFile(
            "blogs.json",
            JSON.stringify([], null, 2),
            "Initialize blogs.json",
            GITHUB_BRANCH
          );
          setBlogs([]);
        }
      }
    };
    fetchBlogs();
  }, [GITHUB_BRANCH]);

  const fetchBlogMeta = useCallback(async (folderName) => {
    setIsLoading(true);
    try {
      const content = await githubFileManager.getFile(
        `${folderName}/metadata.json`,
        GITHUB_BRANCH
      );
      const blogData = JSON.parse(content);
      setSelectedBlog({
        ...blogData,
        folderName
      });
      setSubLinks(blogData.subLinks?.map(link => ({ ...link, id: nanoid() })) || []);
    } catch (error) {
      console.error("Error fetching blog metadata:", error);
      toast.error("Failed to load blog metadata");
    } finally {
      setIsLoading(false);
    }
  }, [GITHUB_BRANCH]);

  const updateSubLinkUrl = (index) => {
    const newUrl = prompt("Enter new URL:", subLinks[index].url);
    if (newUrl !== null) {
      setSubLinks(prevLinks =>
        prevLinks.map((link, i) =>
          i === index ? { ...link, url: newUrl } : link
        )
      );
    }
  };

  const addSubLink = () => {
    const title = prompt("Enter title:");
    if (!title) return;

    const url = prompt("Enter URL:");
    if (!url) return;

    setSubLinks(prevLinks => [
      ...prevLinks,
      { id: nanoid(), title, url }
    ]);
  };

  const deleteSubLink = (index) => {
    setSubLinks(prevLinks => prevLinks.filter((_, i) => i !== index));
  };

  const moveSubLink = useCallback((dragIndex, hoverIndex) => {
    setSubLinks(prevLinks => {
      const updatedLinks = [...prevLinks];
      const [movedItem] = updatedLinks.splice(dragIndex, 1);
      updatedLinks.splice(hoverIndex, 0, movedItem);
      return updatedLinks;
    });
  }, []);

  const handleSubmit = async () => {
    if (!selectedBlog) {
      toast.error("Please select a blog first");
      return;
    }
  
    const updatedData = {
      ...selectedBlog,
      subLinks: subLinks.map(({ id, ...rest }) => rest) // Remove the temporary id before saving
    };
  
    try {
      setIsLoading(true);
      
      await githubFileManager.uploadFile(
        `${selectedBlog.folderName}/metadata.json`,
        JSON.stringify(updatedData, null, 2),
        `Update metadata for ${selectedBlog.title}`,
        GITHUB_BRANCH
      );
      
      toast.success("Blog metadata updated successfully!");
      
      // Update local state with the saved version (without temp ids)
      setSelectedBlog(updatedData);
      setSubLinks(updatedData.subLinks.map(link => ({ ...link, id: nanoid() })));
      
    } catch (error) {
      console.error("Error updating blog metadata:", error);
      toast.error("Failed to update blog metadata");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <br />
      <br />
      <div className="max-w-2xl mx-auto py-6 mt-15">
        <ToastContainer position="top-right" autoClose={3000} />
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold dark:text-white">
              Manage Blog Sub-Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <ul className="max-h-40 overflow-auto border rounded-md p-2 dark:border-gray-700 dark:bg-gray-800">
              {blogs
                .filter(blog => blog.title.toLowerCase().includes(search.toLowerCase()))
                .map(blog => (
                  <li
                    key={blog.folderName}
                    onClick={() => fetchBlogMeta(blog.folderName)}
                    className={`cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition ${
                      selectedBlog?.folderName === blog.folderName 
                        ? "bg-gray-200 dark:bg-gray-600" 
                        : "dark:text-white"
                    }`}
                  >
                    {blog.title}
                  </li>
                ))}
            </ul>
            {selectedBlog && (
              <>
                <div className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                  <h3 className="font-medium dark:text-white">{selectedBlog.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Author: {selectedBlog.author}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date: {selectedBlog.date}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tags: {selectedBlog.tags?.join(", ")}
                  </p>
                </div>
                
                <div className="mt-4">
                  <Button 
                    onClick={addSubLink} 
                    className="flex items-center gap-2 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                  >
                    <Plus size={16} /> Add Sub-Link
                  </Button>
                  
                  {subLinks.length > 0 ? (
                    <ul className="mt-4">
                      {subLinks.map((link, index) => (
                        <DraggableSubLink
                          key={link.id}
                          index={index}
                          {...link}
                          moveSubLink={moveSubLink}
                          updateSubLinkUrl={updateSubLinkUrl}
                          requestDelete={deleteSubLink}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-gray-500 dark:text-gray-400">
                      No sub-links yet. Add some using the button above.
                    </p>
                  )}
                </div>
                
                <Button 
                  onClick={handleSubmit} 
                  className="mt-4 bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                  disabled={isLoading}
                >
                  <Save size={16} /> {isLoading ? "Saving..." : "Submit Changes"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  );
};

export default BlogMetaManager;