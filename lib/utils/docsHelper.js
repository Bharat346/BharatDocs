/* =====================================
   Scroll detection helper
   Usage: const { showScrollTop } = useScrollDetector(ref);
===================================== */
import { useEffect, useState } from "react";

export function useScrollDetector(ref, threshold = 300) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    const onScroll = () => setShowScrollTop(el.scrollTop > threshold);
    el.addEventListener("scroll", onScroll);

    return () => el.removeEventListener("scroll", onScroll);
  }, [ref, threshold]);

  const scrollToTop = () => ref?.current?.scrollTo({ top: 0, behavior: "smooth" });

  return { showScrollTop, scrollToTop };
}

/**
 * Extract headings from a scroll container safely.
 * - No document.querySelector
 * - Stable unique keys
 * - Handles duplicate/empty IDs
 */
export function useHeadingsFromRef(containerRef, mdxContent) {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    let timeoutId;
    let observer;

    const tryExtract = () => {
      const container = containerRef?.current;
      
      // If container isn't ready yet but we have content, retry soon
      if (!container) {
        if (mdxContent) {
          timeoutId = setTimeout(tryExtract, 50);
        }
        return;
      }

      const extract = () => {
        const nodes = container.querySelectorAll(
          "h1, h2, h3, h4, h5, h6"
        );

        const idCount = new Map();
        const result = [];

        nodes.forEach((el, index) => {
          const rawId = el.id?.trim() || "heading";
          const count = idCount.get(rawId) ?? 0;
          idCount.set(rawId, count + 1);

          const uniqueId = count === 0 ? rawId : `${rawId}--${count}`;

          if (el.id !== uniqueId) {
            el.id = uniqueId;
          }

          result.push({
            id: uniqueId,
            key: `${uniqueId}-${index}`,
            text: el.textContent?.replace(/\s+/g, " ").trim() || "",
            level: Number(el.tagName[1]),
          });
        });

        setHeadings(result);
      };

      // Initial extract and setup observer
      extract();
      
      observer = new MutationObserver(extract);
      observer.observe(container, { 
        childList: true, 
        subtree: true,
        characterData: true,
        attributes: true
      });
    };

    tryExtract();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (observer) observer.disconnect();
    };
  }, [containerRef, mdxContent]);

  return headings;
}
