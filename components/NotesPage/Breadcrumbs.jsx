"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useThemeContext } from "../ThemeProvider";

export default function Breadcrumbs({
  slugArray = [],
  basePath = "/notes",
  baseLabel = "Notes",
  maxItems = 4,
  showHome = false,
  className = "",
}) {
  const { theme } = useThemeContext();
  
  if (slugArray.length === 0 && !showHome) {
    return null;
  }

  // Build all items with correct paths
  const allItems = [
    ...(showHome ? [{ slug: "home", path: "/", label: "Home" }] : []),
    { slug: "base", path: basePath, label: baseLabel },
    ...slugArray.map((slug, index) => ({
      slug,
      path: `${basePath}/${slugArray.slice(0, index + 1).join("/")}`,
      label: slug,
    })),
  ];

  // Determine which items to show (with truncation if needed)
  const shouldTruncate = allItems.length > maxItems;
  let displayItems = [];

  if (shouldTruncate) {
    const keepFirst = showHome ? 2 : 1;
    const keepLast = maxItems - keepFirst - 1;
    
    displayItems = [
      ...allItems.slice(0, keepFirst),
      { 
        slug: "ellipsis", 
        label: "…", 
        isEllipsis: true,
        path: allItems[allItems.length - keepLast - 1]?.path || basePath
      },
      ...allItems.slice(-keepLast),
    ];
  } else {
    displayItems = allItems;
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center gap-1 ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.isEllipsis;
          
          return (
            <li key={`${item.slug}-${index}`} className="flex items-center gap-1 font-roboto">
              {/* Separator */}
              {index > 0 && (
                <ChevronRight 
                  className={`h-3.5 w-3.5 flex-shrink-0 transition-colors duration-200 ${
                    theme === "dark" ? "text-zinc-500" : "text-gray-400"
                  }`}
                  aria-hidden="true" 
                />
              )}

              {/* Content */}
              {isEllipsis ? (
                <Link
                  href={item.path}
                  className={`px-1.5 transition-colors duration-200 ${
                    theme === "dark" 
                      ? "text-zinc-500 hover:text-zinc-300" 
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Click to expand"
                  prefetch={false}
                >
                  …
                </Link>
              ) : (
                <Link
                  href={item.path}
                  className={`transition-all duration-200 truncate max-w-[160px] capitalize hover:underline underline-offset-2 ${
                    isLast 
                      ? `font-medium ${
                          theme === "dark" 
                            ? "text-zinc-100" 
                            : "text-gray-900"
                        }` 
                      : `${
                          theme === "dark" 
                            ? "text-zinc-400 hover:text-zinc-100" 
                            : "text-gray-500 hover:text-gray-800"
                        }`
                  }`}
                  title={item.label}
                  prefetch={false}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.slug === "home" ? (
                    <Home className={`h-3.5 w-3.5 ${
                      theme === "dark" 
                        ? "text-zinc-400 hover:text-zinc-100" 
                        : "text-gray-500 hover:text-gray-800"
                    } transition-colors duration-200`} 
                      aria-label="Home" 
                    />
                  ) : (
                    item.label
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {/* Count badge when truncated */}
      {shouldTruncate && (
        <span 
          className={`ml-2 text-xs px-1.5 py-0.5 rounded transition-colors duration-200 ${
            theme === "dark" 
              ? "text-zinc-500 bg-zinc-800/50" 
              : "text-gray-500 bg-gray-200"
          }`}
          title={`${allItems.length} total segments`}
        >
          {allItems.length}
        </span>
      )}
    </nav>
  );
}