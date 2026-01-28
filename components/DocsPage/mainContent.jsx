"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import {
  Home,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Layers,
  FileText,
  Calendar,
  Clock,
  ChevronUp,
  Info,
} from "lucide-react";
import MDXContent from "./MDXContent";

const MainContent = forwardRef(function MainContent({
  theme,
  selectedChild,
  mdxContent,
  loading,
  headings = [],
  activeHeadingId,
  onHomeClick,
  onSidebarToggle,
  sidebarOpen,
  onTocToggle,
  tocOpen,
  isMobile = false,
}, ref) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Scroll to top handler
  const scrollToTop = () => {
    if (ref.current) {
      ref.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        setShowScrollTop(ref.current.scrollTop > 400);
      }
    };

    const contentRef = ref.current;
    if (contentRef) {
      contentRef.addEventListener("scroll", handleScroll);
      return () => contentRef.removeEventListener("scroll", handleScroll);
    }
  }, [ref]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Unknown date";
    }
  };

  const metadataItems = selectedChild
    ? [
        {
          icon: Calendar,
          label: "Updated",
          value: formatDate(selectedChild.updatedAt),
        },
        {
          icon: Clock,
          label: "ID",
          value: selectedChild.nodeId?.substring(0, 8) + "...",
          isMono: true,
        },
      ]
    : [];

  const handleHeadingClickFromMDX = (id) => {
    const container = ref.current;
    const element = document.getElementById(id);

    if (!container || !element) return;

    const containerTop = container.getBoundingClientRect().top;
    const elementTop = element.getBoundingClientRect().top;

    const scrollOffset = elementTop - containerTop + container.scrollTop - 80;

    container.scrollTo({
      top: scrollOffset,
      behavior: "smooth",
    });
  };

  const renderEmptyState = () => (
    <div className="h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 sm:mb-6 ${
          theme === "dark"
            ? "bg-zinc-800/50 text-zinc-600"
            : "bg-gray-100 text-gray-400"
        }`}
      >
        <FileText size={32} className="sm:size-40" />
      </div>
      <h3
        className={`text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-center ${
          theme === "dark" ? "text-zinc-300" : "text-gray-800"
        }`}
      >
        Select a Document
      </h3>
      <p
        className={`mb-6 sm:mb-8 text-center max-w-sm px-4 ${
          theme === "dark" ? "text-zinc-500" : "text-gray-600"
        }`}
      >
        Choose a document from the sidebar to view its content
      </p>
      <button
        onClick={onSidebarToggle}
        className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-medium transition-all duration-200 flex items-center shadow-lg hover:shadow-xl active:scale-[0.98] ${
          theme === "dark"
            ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-500/20"
            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/30"
        }`}
      >
        <Menu className="mr-2 size-4 sm:size-[18px]" />
        <span className="text-sm sm:text-base">Open Sidebar</span>
      </button>
    </div>
  );

  const renderLoadingState = () => (
    <div className="h-full flex flex-col items-center justify-center p-6 sm:p-8">
      <div className="relative">
        <div
          className={`animate-spin rounded-full h-14 w-14 sm:h-16 sm:w-16 border-2 ${
            theme === "dark"
              ? "border-zinc-700 border-t-blue-500"
              : "border-gray-200 border-t-blue-600"
          }`}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText
            size={20}
            className="sm:size-24"
          />
        </div>
      </div>
      <p
        className={`mt-5 sm:mt-6 text-base sm:text-lg font-medium ${
          theme === "dark" ? "text-zinc-400" : "text-gray-600"
        }`}
      >
        Loading document...
      </p>
      <p
        className={`mt-1.5 sm:mt-2 text-sm ${
          theme === "dark" ? "text-zinc-500" : "text-gray-500"
        }`}
      >
        {selectedChild?.name}
      </p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header - More Responsive */}
      <header
        className={`h-16 sm:h-28 border-b sticky top-0 z-30 shrink-0 ${
          theme === "dark"
            ? "bg-zinc-900/95 border-zinc-800 backdrop-blur-xl"
            : "bg-white/95 border-gray-200 backdrop-blur-xl"
        }`}
      >
        <div className="h-full px-3 sm:px-4 md:px-6 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sidebar Toggle - Always visible */}
            <button
              onClick={onSidebarToggle}
              className={`rounded-lg sm:rounded-xl transition-all duration-200 active:scale-[0.95] ${
                theme === "dark"
                  ? "hover:bg-zinc-800/80 text-zinc-300 hover:text-white"
                  : "hover:bg-gray-100/80 text-gray-700 hover:text-gray-900"
              }`}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? (
                <ChevronLeft className="sm:size-5" />
              ) : (
                <ChevronRight className="sm:size-5" />
              )}
            </button>

            {/* Home Button - Hidden on mobile */}
            <button
              onClick={onHomeClick}
              className={`hidden sm:block p-2 rounded-xl transition-all duration-200 active:scale-[0.95] ${
                theme === "dark"
                  ? "hover:bg-zinc-800/80 text-zinc-300 hover:text-white"
                  : "hover:bg-gray-100/80 text-gray-700 hover:text-gray-900"
              }`}
              title="Go Home"
            >
              <Home className="sm:size-5" />
            </button>

            {/* Document Title */}
            {selectedChild && (
              <div className="ml-1 sm:ml-2 min-w-0">
                <h1
                  className={`text-base sm:text-lg md:text-xl font-semibold truncate max-w-[150px] xs:max-w-[180px] sm:max-w-xs ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {selectedChild.name}
                </h1>
                {selectedChild.description && (
                  <p
                    className={`hidden xs:block text-xs truncate mt-0.5 ${
                      theme === "dark" ? "text-zinc-400" : "text-gray-600"
                    }`}
                  >
                    {selectedChild.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* TOC Toggle */}
            <button
              onClick={onTocToggle}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 active:scale-[0.95] ${
                theme === "dark"
                  ? "hover:bg-zinc-800/80 text-zinc-300 hover:text-white"
                  : "hover:bg-gray-100/80 text-gray-700 hover:text-gray-900"
              }`}
              aria-label="Table of Contents"
            >
              <Layers  className="sm:size-5" />
              <span className="hidden sm:inline text-sm">Contents</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Stats Panel */}
      {showStats && selectedChild && (
        <div
          className={`sm:hidden px-4 py-3 border-b ${
            theme === "dark"
              ? "bg-zinc-800/80 border-zinc-700/50"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex flex-wrap gap-3">
            {metadataItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                  theme === "dark"
                    ? "bg-zinc-700/50 text-zinc-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <item.icon size={12} className="opacity-70" />
                <span className="text-xs font-medium">{item.label}:</span>
                <span
                  className={`text-xs ${item.isMono ? "font-mono" : ""}`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable Main Content */}
      <main
        ref={ref}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        {!selectedChild ? (
          renderEmptyState()
        ) : loading ? (
          renderLoadingState()
        ) : (
          <div className="h-full">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
              {/* Document Content */}
              {mdxContent ? (
                <div
                  className={`prose prose-sm sm:prose-base lg:prose-lg max-w-none ${
                    theme === "dark" ? "prose-invert" : ""
                  }`}
                >
                  <MDXContent
                    content={mdxContent}
                    theme={theme}
                    onHeadingClick={handleHeadingClickFromMDX}
                  />
                </div>
              ) : (
                <div
                  className={`text-center py-12 sm:py-16 rounded-xl sm:rounded-2xl ${
                    theme === "dark"
                      ? "bg-zinc-800/30 border border-zinc-700/30"
                      : "bg-white/50 border border-gray-200"
                  }`}
                >
                  <FileText
                    size={48}
                    className={`mx-auto mb-4 sm:mb-6 ${
                      theme === "dark" ? "text-zinc-600" : "text-gray-400"
                    }`}
                  />
                  <h3
                    className={`text-xl sm:text-2xl font-bold mb-2 sm:mb-3 ${
                      theme === "dark" ? "text-zinc-300" : "text-gray-800"
                    }`}
                  >
                    No Content Available
                  </h3>
                  <p
                    className={`max-w-sm sm:max-w-md mx-auto px-4 ${
                      theme === "dark" ? "text-zinc-500" : "text-gray-600"
                    }`}
                  >
                    This document doesn't have any content available.
                  </p>
                </div>
              )}

              {/* Stats Section at Bottom */}
              {selectedChild && metadataItems.length > 0 && (
                <div className="mt-12 pt-6 border-t">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <h4
                        className={`text-sm font-medium ${
                          theme === "dark" ? "text-zinc-400" : "text-gray-600"
                        }`}
                      >
                        Document Information
                      </h4>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {metadataItems.map((item, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                              theme === "dark"
                                ? "bg-zinc-800/50 text-zinc-300"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            <item.icon size={14} className="opacity-70" />
                            <span className="text-xs font-medium">
                              {item.label}:
                            </span>
                            <span
                              className={`text-xs ${
                                item.isMono ? "font-mono" : ""
                              }`}
                            >
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Share/Info Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          theme === "dark"
                            ? "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Print
                      </button>
                      <button
                        onClick={scrollToTop}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          theme === "dark"
                            ? "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Back to Top
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom spacing */}
              <div className="h-8 sm:h-12" />
            </div>
          </div>
        )}
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 p-2.5 sm:p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 z-40 ${
            theme === "dark"
              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-500/30"
              : "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/40"
          }`}
          aria-label="Scroll to top"
        >
          <ChevronUp size={18} className="sm:size-20" />
        </button>
      )}
    </div>
  );
});

export default MainContent;