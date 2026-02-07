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
    const container = containerRef?.current;
    if (!container || !mdxContent) {
      setHeadings([]);
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

        // guaranteed unique + stable
        const uniqueId =
          count === 0 ? rawId : `${rawId}--${count}`;

        // IMPORTANT: sync DOM id so scroll + IO work
        if (el.id !== uniqueId) {
          el.id = uniqueId;
        }

        result.push({
          id: uniqueId,
          key: `${uniqueId}-${index}`, // React-only key
          text: el.textContent?.replace(/\s+/g, " ").trim() || "",
          level: Number(el.tagName[1]),
        });
      });

      setHeadings(result);
    };

    const raf = requestAnimationFrame(extract);
    const observer = new MutationObserver(extract);
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [containerRef, mdxContent]);

  return headings;
}

