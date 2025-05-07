import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createGitHubFileManager } from "@/lib/github_file_manager";
import { toast } from "react-toastify";
import { Loader2 , AlertCircle  } from "lucide-react";
import OfflinePage from "../offline";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import NetworkErrorAlert from "@/components/tools/ContentAlert";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false); // Track offline state

  const navigate = useNavigate();
  const location = useLocation();

  const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER;
  const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO;
  const GITHUB_BRANCH = import.meta.env.VITE_GITHUB_BRANCH;
  const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

  const githubFileManager = createGitHubFileManager(
    GITHUB_TOKEN,
    GITHUB_OWNER,
    GITHUB_REPO
  );

  const getQueryParams = () => {
    const params = new URLSearchParams(location.search);
    return Object.fromEntries(params.entries());
  };

  const selectedCategory = getQueryParams().category || "";

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        // Check online status first
        if (!navigator.onLine) {
          setIsOffline(true);
          return;
        }

        const content = await githubFileManager.getFile(
          "blogs.json",
          GITHUB_BRANCH
        );
        const data = JSON.parse(content);
        setBlogs(data || []);
        setIsOffline(false); // Ensure offline state is reset if successful
      } catch (error) {
        console.error("Error fetching blogs:", error);

        if (error.message.includes("Failed to fetch") || !navigator.onLine) {
          setIsOffline(true);
        } else {
          // toast.error("Failed to load blog list");
        }

        if (error.message.includes("File not found")) {
          try {
            await githubFileManager.uploadFile(
              "blogs.json",
              JSON.stringify([], null, 2),
              "Initialize blogs.json",
              GITHUB_BRANCH
            );
            setBlogs([]);
          } catch (uploadError) {
            setIsOffline(true);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();

    // Add event listeners for online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [GITHUB_BRANCH, location.search]);

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(blogs.map((b) => b.category).filter(Boolean))
  );

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    const params = new URLSearchParams(location.search);
    if (newCategory) {
      params.set("category", newCategory);
    } else {
      params.delete("category");
    }
    navigate({ search: params.toString() });
  };

  // Show offline page if we're offline
  if (isOffline && blogs.length === 0) {
    return <OfflinePage />;
  }

  return (
    <div
      className="p-6 mx-auto bg-white dark:bg-gray-900 min-h-screen"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Filters: Search + Category */}
      <div className="w-[90%] mt-14 mb-6 flex sm:flex-row justify-center items-center gap-4">
        <Input
          type="text"
          placeholder="Search blogs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2"
            >
              <Filter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-44 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <DropdownMenuItem
              onClick={() => handleCategoryChange({ target: { value: "" } })}
            >
              All Categories
            </DropdownMenuItem>
            {categories.map((cat) => (
              <DropdownMenuItem
                key={cat}
                onClick={() => handleCategoryChange({ target: { value: cat } })}
              >
                {cat}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="animate-spin text-blue-500 dark:text-[#00bdfc] w-10 h-10" />
        </div>
      ) : (
        // Blog Cards
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md1023:gap-70 md1100:gap-5">
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog) => (
              <Card
                key={blog._id}
                className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800 border dark:border-gray-700 w-[300px] mx-auto"
              >
                <div className="w-full h-auto">
                  <img
                    onClick={() =>
                      navigate(`${blog.folderName}?s=${blog.firstPageUrl}`)
                    }
                    src={
                      blog.imageUrl ||
                      "https://via.placeholder.com/300x169?text=No+Image"
                    }
                    alt={blog.title}
                    className="w-[90%] aspect-[16/9] object-contain rounded-md mb-3 mx-auto"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    {blog.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4">
                    {blog.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span className="font-medium">updated</span> - {blog.date}
                  </p>
                  <Button
                    className="mt-4 justify-center w-full bg-gray-900 hover:bg-white hover:border-2 hover:text-black hover:border-gray-900 text-white dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-white"
                    onClick={() =>
                      navigate(`${blog.folderName}?s=${blog.firstPageUrl}`)
                    }
                  >
                    Visit Blog
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
           <NetworkErrorAlert/>
          )}
        </div>
      )}
    </div>
  );
}
