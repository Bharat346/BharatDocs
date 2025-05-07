import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MDXProvider } from "@mdx-js/react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { useCustomMDXComponents } from "@/components/mdx/MdxProvider";

export const BlogContent = ({ content, loading }) => {
  const [MDXContent, setMDXContent] = useState(null);
  const components = useCustomMDXComponents();
  
  useEffect(() => {
    if (content) {
      const compileMdx = async () => {
        try {
          const { default: Content } = await evaluate(content, {
            ...runtime,
            useMDXComponents: () => components
          });
          setMDXContent(() => Content);
        } catch (error) {
          console.error("Error compiling MDX:", error);
          // Consider setting some error state to display to users
        }
      };
      compileMdx();
    }
  }, [content, components]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-64 w-full mt-4" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Content not available
      </div>
    );
  }

  return (
    <div className="custom-prose blog-template-container p-6 max-w-none">
      {/* Remove the nested MDXProvider - it's redundant since we already passed components to evaluate */}
      {MDXContent ? <MDXContent /> : (
        <div className="text-center text-gray-500 dark:text-gray-400">
          Loading content...
        </div>
      )}
    </div>
  );
};