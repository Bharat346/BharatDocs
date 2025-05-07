import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ArrowLeft , ArrowRight } from "lucide-react";

export const BlogHeader = ({
  title,
  tags,
  isMobile,
  onMenuToggle,
  currentPageIndex,
  totalPages,
  onPrev,
  onNext,
}) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              {title}
            </h1>
            {tags && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag, index) => (
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
          {isMobile && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMenuToggle}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentPageIndex + 1} of {totalPages} pages
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              disabled={currentPageIndex <= 0}
              className="gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={currentPageIndex >= totalPages - 1}
              className="gap-1"
            >
              <span className="hidden sm:inline">Next</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};