import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createGitHubFileManager } from "@/lib/github_file_manager";

export default function AddBlog() {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);

  const updateBlogsJson = async (blogData) => {
    try {
      const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
      const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER || 'docs_Bharat346';
      const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || 'docs_Bharat346';
      const GITHUB_BRANCH = import.meta.env.VITE_GITHUB_BRANCH || 'main';
  
      if (!GITHUB_TOKEN) {
        throw new Error("GitHub token is missing");
      }
  
      const github = createGitHubFileManager(GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO);
      const blogsJsonPath = `blogs.json`;
      
      // Get existing blogs or create empty array if file doesn't exist
      let existingBlogs = [];
      try {
        const existingContent = await github.getFile(blogsJsonPath, GITHUB_BRANCH);
        existingBlogs = JSON.parse(existingContent);
      } catch (err) {
        if (err.message !== 'File not found') throw err;
      }
      
      // Generate folder name
      const folderName = blogData.baseUrl
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase();
      
      // Create new blog entry
      const newBlog = {
        id: Date.now().toString(),
        title: blogData.title,
        author: blogData.author,
        description: blogData.description,
        category: blogData.category,
        date: new Date().toISOString().split('T')[0],
        tags: blogData.tags.split(',').map(tag => tag.trim()),
        folderName,
        imageUrl: blogData.imageUrl,
        firstPageUrl: blogData.firstPageUrl
      };
      
      // Add new blog to existing blogs
      const updatedBlogs = [...existingBlogs, newBlog];
      
      // Upload updated blogs.json
      await github.uploadFile(
        blogsJsonPath,
        JSON.stringify(updatedBlogs, null, 2),
        `Add new blog: ${blogData.title}`,
        GITHUB_BRANCH
      );
      
      return true;
    } catch (error) {
      console.error("❌ Failed to update blogs.json:", error.message);
      throw error;
    }
  };

  const createGitHubStructure = async (blogData) => {
    try {
      const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
      const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER || 'docs_Bharat346';
      const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || 'docs_Bharat346';
      const GITHUB_BRANCH = import.meta.env.VITE_GITHUB_BRANCH || 'main';
  
      if (!GITHUB_TOKEN) {
        throw new Error("GitHub token is missing");
      }
  
      const github = createGitHubFileManager(GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO);
  
      // Generate folder name
      const folderName = blogData.baseUrl
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase();
  
      const folderPath = `${folderName}`;
      const metadataPath = `${folderPath}/metadata.json`;
  
      // Create metadata object
      const metadata = {
        title: blogData.title,
        author: blogData.author,
        date: new Date().toISOString().split('T')[0],
        tags: blogData.tags.split(',').map(tag => tag.trim()),
        folderName,
        blogName: blogData.title,
        subLinks: []
      };
  
      // Upload metadata.json
      await github.uploadFile(
        metadataPath,
        JSON.stringify(metadata, null, 2),
        `Add metadata for ${blogData.title}`,
        GITHUB_BRANCH
      );
  
      console.log("✅ Blog structure created.");
      return true;
    } catch (error) {
      console.error("❌ Failed to create GitHub structure:", error.message);
      throw error;
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // 1. Update blogs.json with the new blog data
      await updateBlogsJson(data);
      
      // 2. Create GitHub folder structure and metadata
      await createGitHubStructure(data);
      
      toast.success("Blog added successfully!");
      reset();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to add blog");
    }

    setLoading(false);
  };

  return (
    <>
      <br /><br />
      <div className="flex justify-center items-center min-h-screen px-4 mt-4 bg-gray-100 dark:bg-gray-900">
        <Card className="w-full max-w-2xl p-6 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center">Add a New Blog</CardTitle>
          </CardHeader>
          <CardContent>
            <form 
              onSubmit={handleSubmit(onSubmit)} 
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            >
              {/** Input Fields */}
              {[
                { label: "Category", name: "category", type: "text", placeholder: "Enter blog category" },
                { label: "Title", name: "title", type: "text", placeholder: "Enter blog title" },
                { label: "Description", name: "description", type: "textarea", placeholder: "Enter blog description" },
                { label: "Author", name: "author", type: "text", placeholder: "Enter author name" },
                { label: "Base URL", name: "baseUrl", type: "text", placeholder: "Enter folder name (no spaces/special chars)" },
                { label: "Image URL", name: "imageUrl", type: "text", placeholder: "Enter blog image URL" },
                { label: "Tags", name: "tags", type: "text", placeholder: "Enter blog tags (comma separated)" },
                { label: "First Page URL", name: "firstPageUrl", type: "text", placeholder: "Enter first page URL" },
              ].map((field, index) => (
                <div key={field.name} className="flex flex-col">
                  <Label>{field.label}</Label>
                  {field.type === "textarea" ? (
                    <Textarea 
                      {...register(field.name, { required: true })}
                      placeholder={field.placeholder}
                      className="resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          document.querySelectorAll("input, textarea")[index + 1]?.focus();
                        }
                      }}
                    />
                  ) : (
                    <Input
                      {...register(field.name, { required: true })}
                      placeholder={field.placeholder}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          document.querySelectorAll("input, textarea")[index + 1]?.focus();
                        }
                      }}
                    />
                  )}
                </div>
              ))}

              {/** Submit Button */}
              <div className="md:col-span-2 flex justify-center">
                <Button type="submit" className="w-full max-w-xs mt-2 justify-center" disabled={loading}>
                  {loading ? "Adding..." : "Add Blog"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}