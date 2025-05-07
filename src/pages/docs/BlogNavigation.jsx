import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const BlogNavigation = ({
  currentPageIndex,
  totalPages,
  onPrev,
  onNext,
  isMobile = false,
}) => {
  return (
    <div className={`${isMobile ? "md:hidden" : ""} flex justify-between items-center ${isMobile ? "bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md" : ""}`}>
      <Button
        variant="outline"
        size={isMobile ? "default" : "sm"}
        onClick={onPrev}
        disabled={currentPageIndex <= 0}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        {!isMobile && <span className="hidden sm:inline">Previous</span>}
        {isMobile && "Previous"}
      </Button>
      <span className="text-sm text-gray-500 dark:text-gray-400 px-2">
        {currentPageIndex + 1}/{totalPages}
      </span>
      <Button
        variant="outline"
        size={isMobile ? "default" : "sm"}
        onClick={onNext}
        disabled={currentPageIndex >= totalPages - 1}
        className="gap-2"
      >
        {!isMobile && <span className="hidden sm:inline">Next</span>}
        {isMobile && "Next"}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};