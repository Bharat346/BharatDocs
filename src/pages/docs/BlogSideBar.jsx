import { X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BlogSidebar = ({
  title,
  subLinks,
  currentPage,
  onPageChange,
  sidebarOpen,
  setSidebarOpen,
}) => {
  return (
    <aside
      className={`${
        sidebarOpen
          ? "fixed inset-0 z-10 p-4 bg-white dark:bg-gray-800 w-64 h-full overflow-y-auto mt-16 md:mt-0 md:relative md:inset-auto"
          : "hidden md:block"
      } w-full md:w-64 flex-shrink-0 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 md:sticky md:top-6 h-fit transition-all duration-300`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {title}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(false)}
          className="md:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ul className="space-y-1">
        {subLinks.map((page, index) => (
          <li
            key={index}
            className={`transition-colors rounded-md ${
              page.url === currentPage
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            <button
              onClick={() => onPageChange(page.url)}
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
  );
};