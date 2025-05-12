import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { toast } from "react-toastify";
import { createGitHubFileManager } from "@/lib/github_file_manager";
import { CacheManager } from "@/lib/cacheManager";
import matter from 'gray-matter';
import { Skeleton } from "@/components/ui/skeleton";

// Import components
import { BlogContent } from "./BlogContent";
import { BlogNavigation } from "./BlogNavigation";
import { BlogSidebar } from "./BlogSideBar";
import { BlogHeader } from "./BlogHeader";
import { MobileHeader } from "./MobileHeader";
import { ScrollProgress, useScrollProgress } from "./ScrollProgress";

const blogCache = new CacheManager('blog_template', {
  ttl: 5 * 60 * 1000, // 5 minutes
  useMemoryCache: true
});

export default function BlogTemplate() {
  const { blogId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialPage = searchParams.get("s") || "";
  const [blogData, setBlogData] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [mdxContent, setMdxContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollProgress = useScrollProgress();

  // GitHub configuration
  const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER;
  const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO;
  const GITHUB_BRANCH = import.meta.env.VITE_GITHUB_BRANCH || "main";
  const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

  // Initialize GitHub file manager
  const githubFileManager = createGitHubFileManager(
    GITHUB_TOKEN,
    GITHUB_OWNER,
    GITHUB_REPO
  );

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        
        // Try cache first
        const cacheKey = `${blogId}_metadata`;
        const cachedData = await blogCache.getWithFallback(
          cacheKey,
          async () => {
            const metadataContent = await githubFileManager.getFile(
              `${blogId}/metadata.json`,
              GITHUB_BRANCH
            );
            return JSON.parse(metadataContent);
          }
        );

        if (!cachedData) throw new Error("No blog data found");
        if (!cachedData.subLinks || cachedData.subLinks.length === 0) {
          throw new Error("No subLinks found in metadata");
        }

        setBlogData(cachedData);
        

        // Set initial page
        const pageToSet = initialPage || cachedData.subLinks?.[0]?.url || "";
        if (pageToSet) {
          setCurrentPage(pageToSet);
          if (!initialPage && cachedData.subLinks?.[0]?.url) {
            navigate(`?s=${encodeURIComponent(cachedData.subLinks[0].url)}`, {
              replace: true,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching blog data", error);
        toast.error(`Failed to load blog: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (blogId) {
      fetchBlog();
    }
  }, [blogId, initialPage, navigate]);

  useEffect(() => {
    const fetchMarkdownContent = async () => {
      if (!currentPage || !blogData) return;
    
      try {
        setContentLoading(true);
        
        const cacheKey = `${blogId}_${currentPage}`;
        const rawContent = await blogCache.getWithFallback(
          cacheKey,
          async () => {
            return await githubFileManager.getFile(
              `${blogId}/${currentPage}.mdx`,
              GITHUB_BRANCH
            );
          },
          { ttl: 5 * 60 * 1000 }
        );
    
        // Parse frontmatter
        const { data: frontmatter, content } = matter(rawContent);
        setMdxContent(content || "");
        
        
      } catch (error) {
        console.error("Error loading MDX content", error);
        toast.error(`Failed to load content: ${error.message}`);
        setMdxContent("");
      } finally {
        setContentLoading(false);
      }
    };

    fetchMarkdownContent();
  }, [currentPage, blogData]);

  const currentPageIndex =
    blogData?.subLinks?.findIndex((page) => page.url === currentPage) ?? -1;

  const handlePageChange = (pageUrl) => {
    setCurrentPage(pageUrl);
    navigate(`?s=${encodeURIComponent(pageUrl)}`);
    setSidebarOpen(false);
  };

  const nextPage = () => {
    if (currentPageIndex < blogData.subLinks.length - 1) {
      const nextUrl = blogData.subLinks[currentPageIndex + 1].url;
      handlePageChange(nextUrl);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      const prevUrl = blogData.subLinks[currentPageIndex - 1].url;
      handlePageChange(prevUrl);
    }
  };

  if (loading || !blogData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="space-y-4 w-full max-w-2xl">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ScrollProgress progress={scrollProgress} />
      <MobileHeader title={blogData.title} />

      <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 max-w-7xl mx-auto mt-1 md:mt-12 pt-20 md:pt-6">
        <BlogSidebar
          title={blogData.title}
          subLinks={blogData.subLinks}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="flex-1 mt-0">
          <BlogHeader
            title={blogData.subLinks[currentPageIndex]?.title.replace(/_/g, " ") || "Untitled"}
            tags={blogData.tags}
            isMobile={sidebarOpen}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            currentPageIndex={currentPageIndex}
            totalPages={blogData.subLinks.length}
            onPrev={prevPage}
            onNext={nextPage}
          />

          <Card className="shadow-md rounded-lg overflow-hidden mb-6">
            <BlogContent content={mdxContent} loading={contentLoading} />
          </Card>

          <BlogNavigation
            currentPageIndex={currentPageIndex}
            totalPages={blogData.subLinks.length}
            onPrev={prevPage}
            onNext={nextPage}
            isMobile={true}
          />
        </div>
      </div>
    </div>
  );
}