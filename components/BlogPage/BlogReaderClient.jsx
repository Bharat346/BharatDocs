"use client";

import { useRef } from "react";
import BlogHeader from "./BlogHeader";
import TableOfContents from "@/components/DocsPage/shared/TableofContent";

export default function BlogReaderClient({ blog, mdxContent, headings }) {
  const scrollRef = useRef(null);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground transition-colors">
      <div className="flex-1 flex overflow-hidden pt-20">
        {/* Main Content Scroll Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-background pb-32"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-10 md:py-14 flex flex-col xl:flex-row gap-12 xl:gap-20">
            <div className="flex-1 min-w-0">
              <BlogHeader blog={blog} />

              {/* MDX Content Wrapper with standard prose styles */}
              {mdxContent ? (
                <article
                  id="mdx-content-container"
                  className="prose dark:prose-invert max-w-none min-h-screen mt-10"
                >
                  {mdxContent}
                </article>
              ) : (
                <div className="mt-10 p-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-600 dark:text-neutral-400 text-center">
                  <p className="font-semibold">Content is being prepared.</p>
                  <p className="text-sm mt-1">
                    This blog post is not yet available.
                  </p>
                </div>
              )}
            </div>

            {/* Table of Contents - Concise Floating Block */}
            {headings && headings.length > 0 && (
              <aside className="hidden xl:block w-64 shrink-0">
                <div className="sticky top-10">
                  <TableOfContents
                    headings={headings}
                    containerRef={scrollRef}
                  />
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
