import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Menu, X, Copy, Check } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import { createGitHubFileManager } from "@/lib/github_file_manager";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "./template.css";
import "highlight.js/styles/github-dark.css";
import { Accordion } from "@/components/ui/accordion";

export default function BlogTemplate() {
  const { blogId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialPage = searchParams.get("s") || "";
  const [blogData, setBlogData] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [likes, setLikes] = useState(0);
  const [mdxContent, setMdxContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let animationFrame;
    const updateScrollProgress = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        setScrollProgress(progress);
      });
    };
  
    window.addEventListener("scroll", updateScrollProgress);
    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      cancelAnimationFrame(animationFrame);
    };
  }, []);  

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

  // Custom components for ReactMarkdown
  const markdownComponents = {
    Accordion: ({ node, title, children, ...props }) => {
      return (
        <Accordion title={title} {...props}>
          {children}
        </Accordion>
      );
    },

    // Optional: If you want to handle the details/summary HTML elements directly
    details: ({ node, children, ...props }) => {
      const summary = children.find(
        (child) => child.props?.mdxType === "summary"
      );
      const content = children.filter(
        (child) => child.props?.mdxType !== "summary"
      );

      return (
        <Accordion title={summary?.props?.children || "Accordion"} {...props}>
          {content}
        </Accordion>
      );
    },
    summary: ({ node, children, ...props }) => {
      // This will be handled by the details component above
      return <>{children}</>;
    },
    table: ({ node, ...props }) => (
      <div className="table-container">
        <table {...props} />
      </div>
    ),
    th: ({ node, ...props }) => <th {...props} className="table-header" />,
    td: ({ node, children, ...props }) => {
      // Convert code content to plain text
      const content = React.Children.toArray(children)
        .map((child) => {
          if (typeof child === "string") return child;
          if (child.props && child.props.children) {
            return React.Children.toArray(child.props.children).join("");
          }
          return "";
        })
        .join("");

      return (
        <td className="table-cell" {...props}>
          <span className="table-inline-command">{content}</span>
        </td>
      );
    },
    a: ({ node, ...props }) => (
      <a
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
        {...props}
      />
    ),
    code: ({ node, inline, className, children, ...props }) => {
      const [copied, setCopied] = useState(false);
      const match = /language-(\w+)/.exec(className || "");

      const handleCopy = () => {
        const extractText = (nodes) => {
          if (typeof nodes === "string") return nodes;
          if (Array.isArray(nodes)) return nodes.map(extractText).join("");
          if (typeof nodes === "object" && nodes?.props?.children)
            return extractText(nodes.props.children);
          return "";
        };

        const textToCopy = extractText(children).trim();

        navigator.clipboard.writeText(textToCopy).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      };

      return !inline ? (
        <div className="code-block bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 rounded-md overflow-hidden mb-4">
          <div className="code-header flex items-center justify-between px-3 py-2 bg-gray-200 dark:bg-gray-700 border-b dark:border-gray-600">
            <span className="code-language text-xs font-mono text-gray-600 dark:text-gray-300 uppercase">
              {match?.[1] || "code"}
            </span>
            <button
              onClick={handleCopy}
              className="code-copy-btn flex items-center gap-1 px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded transition duration-200"
              aria-label="Copy code"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span className="code-tooltip">
                {copied ? "Copied!" : "Copy"}
              </span>
            </button>
          </div>
          <pre className="code-content overflow-x-auto p-3 text-sm">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      ) : (
        <code className="inline-code px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          {children}
        </code>
      );
    },
    img: ({ node, ...props }) => (
      <div className="my-6 flex justify-center">
        <img className="rounded-lg shadow-md max-w-full h-auto" {...props} />
      </div>
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 border-blue-500 pl-4 italic my-6 text-gray-700 dark:text-gray-300"
        {...props}
      />
    ),
    h1: ({ node, ...props }) => (
      <h1 className="text-4xl font-bold my-6" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-3xl font-bold my-5" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-2xl font-bold my-4" {...props} />
    ),
    h4: ({ node, ...props }) => (
      <h4 className="text-xl font-bold my-3" {...props} />
    ),
    h5: ({ node, ...props }) => (
      <h5 className="text-lg font-bold my-2" {...props} />
    ),
    h6: ({ node, ...props }) => (
      <h6 className="text-base font-bold my-2" {...props} />
    ),
    p: ({ node, ...props }) => (
      <p className="my-4 leading-relaxed" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className="list-disc pl-6 my-4 space-y-2" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />
    ),
    li: ({ node, ...props }) => <li className="my-1" {...props} />,
    hr: ({ node, ...props }) => (
      <hr className="my-6 border-gray-200 dark:border-gray-700" {...props} />
    ),
  };

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);

        // 1. Fetch metadata.json from the blog folder
        const metadataContent = await githubFileManager.getFile(
          `${blogId}/metadata.json`,
          GITHUB_BRANCH
        );
        const data = JSON.parse(metadataContent);

        if (!data) throw new Error("No blog data found");
        if (!data.subLinks || data.subLinks.length === 0) {
          throw new Error("No subLinks found in metadata");
        }

        // 2. Get likes
        try {
          const likesResponse = await axios.get(
            `http://localhost:5000/api/blogs/${blogId}/likes`
          );
          setLikes(likesResponse.data.likes || 0);
        } catch (error) {
          console.error("Error fetching likes:", error);
          setLikes(0);
        }

        setBlogData(data);

        // 3. Set initial page
        const pageToSet = initialPage || data.subLinks?.[0]?.url || "";
        if (pageToSet) {
          setCurrentPage(pageToSet);
          if (!initialPage && data.subLinks?.[0]?.url) {
            navigate(`?s=${encodeURIComponent(data.subLinks[0].url)}`, {
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
        const content = await githubFileManager.getFile(
          `${blogId}/${currentPage}.mdx`,
          GITHUB_BRANCH
        );
        setMdxContent(content);
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
      <div
  className="fixed top-0 left-0 h-1 z-50 bg-blue-500 transition-all duration-200"
  style={{ width: `${scrollProgress}%` }}
></div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm p-4 z-20 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1 flex-1 text-center px-2">
          {blogData.title}
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 max-w-7xl mx-auto mt-1 md:mt-12 pt-20 md:pt-6">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen
              ? "fixed inset-0 z-10 p-4 bg-white dark:bg-gray-800 w-64 h-full overflow-y-auto mt-16 md:mt-0 md:relative md:inset-auto"
              : "hidden md:block"
          } w-full md:w-64 flex-shrink-0 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 md:sticky md:top-6 h-fit transition-all duration-300`}
        >
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
            {blogData.title}
          </h2>
          <ul className="space-y-1">
            {blogData.subLinks.map((page, index) => (
              <li
                key={index}
                className={`transition-colors rounded-md ${
                  page.url === currentPage
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <button
                  onClick={() => handlePageChange(page.url)}
                  className="w-full text-left p-2 text-sm md:text-base flex items-center gap-2"
                >
                  {page.url === currentPage && (
                    <span className="w-1 h-4 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                  )}
                  <span className="line-clamp-1">
                    {page.title.replace(/_/g, " ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <div className="flex-1 mt-0">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                    {blogData.subLinks[currentPageIndex]?.title.replace(
                      /_/g,
                      " "
                    ) || "Untitled"}
                  </h1>
                  {blogData.tags && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {blogData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden"
                  >
                    {sidebarOpen ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Menu className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentPageIndex + 1} of {blogData.subLinks.length} pages
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPage}
                    disabled={currentPageIndex <= 0}
                    className="gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={currentPageIndex >= blogData.subLinks.length - 1}
                    className="gap-1"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Blog Content */}
          <Card className="shadow-md rounded-lg overflow-hidden mb-6">
            {contentLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-64 w-full mt-4" />
              </div>
            ) : mdxContent ? (
              <div className="custom-prose blog-template-container p-6 max-w-none prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400">
                <ReactMarkdown
                  components={markdownComponents}
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {mdxContent}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                Content not available
              </div>
            )}
          </Card>

          {/* Bottom Navigation - Mobile only */}
          <div className="md:hidden flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <Button
              variant="outline"
              onClick={prevPage}
              disabled={currentPageIndex <= 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400 px-2">
              {currentPageIndex + 1}/{blogData.subLinks.length}
            </span>
            <Button
              variant="outline"
              onClick={nextPage}
              disabled={currentPageIndex >= blogData.subLinks.length - 1}
              className="gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
