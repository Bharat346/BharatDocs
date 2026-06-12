/**
 * GPUPDFViewer — High-performance PDF viewer React component.
 *
 * Architecture:
 *   ┌─────────────────────────────────────────────┐
 *   │  React Component (GPUPDFViewer)             │
 *   │  ├─ PDFWorkerManager  (off-thread render)   │
 *   │  ├─ BitmapCache       (ImageBitmap LRU)     │
 *   │  ├─ VirtualPageManager(visibility tracking)  │
 *   │  ├─ PixiRenderer      (GPU compositing)     │
 *   │  └─ ScrollController  (virtual scroll)      │
 *   └─────────────────────────────────────────────┘
 *
 * Pipeline per frame:
 *   1. ScrollController emits scrollY
 *   2. VirtualPageManager computes visible pages
 *   3. For new visible pages → request render from Worker
 *   4. Worker returns ImageBitmap → BitmapCache stores it
 *   5. PixiRenderer uploads bitmap as GPU texture + composites
 *   6. Distant pages are unloaded (bitmap.close + texture.destroy)
 *
 * Progressive rendering:
 *   - Fast scroll → render at 0.5x scale (low-res preview)
 *   - Scroll settles (120ms) → re-render at full scale (crisp)
 *
 * Zoom:
 *   - During active zoom → GPU scaling only (instant)
 *   - Zoom settles → re-render at new scale (crisp)
 */

"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { PDFWorkerManager } from "./PDFWorkerManager";
import { BitmapCache } from "./BitmapCache";
import { VirtualPageManager } from "./VirtualPageManager";
import { PixiRenderer } from "./PixiRenderer";
import { ScrollController } from "./ScrollController";

// ── Constants ─────────────────────────────────────────────
const LOW_RES_SCALE_FACTOR = 0.4; // During fast scroll
const BASE_DPI_SCALE = 1.5; // Base render quality
const ZOOM_SETTLE_MS = 180; // Debounce for zoom re-render
const SCROLL_SETTLE_MS = 120; // Debounce for scroll re-render

export default function GPUPDFViewer({
  pdfUrl,
  isDark = false,
  onDocumentLoad,
  onPageChange,
  onScaleChange,
  // Imperative controls (called by parent)
  controlRef,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Refs for mutable state (no re-renders)
  const workerRef = useRef(null);
  const cacheRef = useRef(null);
  const vpmRef = useRef(null);
  const rendererRef = useRef(null);
  const scrollRef = useRef(null);

  const scaleRef = useRef(1);
  const scrollYRef = useRef(0);
  const directionRef = useRef("idle");
  const pendingRenders = useRef(new Set());
  const zoomTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const isScrollingRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);

  // ── Render visible pages ────────────────────────────────
  const renderVisiblePages = useCallback(
    async (forceHighRes = false) => {
      const vpm = vpmRef.current;
      const worker = workerRef.current;
      const cache = cacheRef.current;
      const renderer = rendererRef.current;
      if (!vpm || !worker || !cache || !renderer?.isReady) return;

      const scrollY = scrollYRef.current;
      const viewH = containerRef.current?.clientHeight || 800;
      const { visible, preload, unload } = vpm.getVisiblePages(
        scrollY,
        viewH / scaleRef.current,
      );

      // Predictive prefetch
      const predicted = vpm.getPredictivePages(directionRef.current, visible);
      const allNeeded = [...new Set([...visible, ...preload, ...predicted])];

      // Unload distant pages
      for (const pg of unload) {
        renderer.removePage(pg);
      }

      // Determine render scale
      const isScrolling = isScrollingRef.current && !forceHighRes;
      const renderScale = isScrolling
        ? BASE_DPI_SCALE * LOW_RES_SCALE_FACTOR
        : BASE_DPI_SCALE;

      // Render needed pages
      for (const pageNum of allNeeded) {
        // Skip if already rendering this page
        if (pendingRenders.current.has(pageNum)) continue;

        // Check cache for usable bitmap

        const cached = cache.has(pageNum, renderScale)
          ? cache.get(pageNum, renderScale)
          : !isScrolling
            ? cache.getBestMatch(pageNum)
            : null;

        if (cached) {
          const rect = vpm.getPageRect(pageNum);
          if (rect) {
            renderer.setPageBitmap(
              pageNum,
              cached.bitmap,
              rect,
              vpm.maxPageWidth,
            );
          }
          if (cached.scale >= renderScale - 0.01) continue; // Good enough
          if (isScrolling) continue; // Don't upgrade during scroll
        }

        // Request render from worker
        pendingRenders.current.add(pageNum);

        worker
          .renderPage(pageNum, renderScale, isScrolling ? "low" : "high")
          .then((result) => {
            if (!isMountedRef.current) {
              result.bitmap?.close();
              return;
            }
            pendingRenders.current.delete(pageNum);

            // Store in cache
            cache.set(
              pageNum,
              result.scale,
              result.bitmap,
              result.width,
              result.height,
            );

            // Upload to GPU
            const rect = vpmRef.current?.getPageRect(pageNum);
            if (rect && rendererRef.current?.isReady) {
              rendererRef.current.setPageBitmap(
                pageNum,
                result.bitmap,
                rect,
                vpmRef.current.maxPageWidth,
              );
            }
          })
          .catch((err) => {
            pendingRenders.current.delete(pageNum);
            console.warn(
              `[GPUPDFViewer] Render failed for page ${pageNum}:`,
              err,
            );
          });
      }

      // Update current page
      if (visible.length > 0 && visible[0] !== currentPage) {
        setCurrentPage(visible[0]);
        onPageChange?.(visible[0]);
      }
    },
    [currentPage, onPageChange],
  );

  // ── Initialize pipeline ─────────────────────────────────
  useEffect(() => {
    if (!pdfUrl || !canvasRef.current || !containerRef.current) return;
    isMountedRef.current = true;

    let destroyed = false;

    const init = async () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const w = container.clientWidth;
      const h = container.clientHeight;

      // 1. Init PixiJS renderer
      const renderer = new PixiRenderer();
      await renderer.init(canvas, w, h, isDark);
      rendererRef.current = renderer;

      // 2. Init bitmap cache
      const cache = new BitmapCache(24);
      cacheRef.current = cache;

      // 3. Init worker and load PDF
      const worker = new PDFWorkerManager();
      workerRef.current = worker;

      setLoadProgress(10);
      const { numPages, pageDimensions } = await worker.loadPDF(pdfUrl);
      if (destroyed) return;

      setTotalPages(numPages);
      setLoadProgress(50);
      onDocumentLoad?.({ numPages });

      // 4. Init virtual page manager
      const vpm = new VirtualPageManager(pageDimensions);
      vpmRef.current = vpm;

      // 5. Init scroll controller
      const scroll = new ScrollController(container, {
        onScroll: (y) => {
          scrollYRef.current = y;
          renderer.setScroll(y);
          isScrollingRef.current = true;

          // Light-weight visible page update during scroll
          requestAnimationFrame(() => renderVisiblePages(false));
        },
        onScrollEnd: () => {
          isScrollingRef.current = false;
          // Re-render at full quality
          renderVisiblePages(true);
        },
        onDirectionChange: (dir) => {
          directionRef.current = dir;
        },
        onZoom: (val, isRatio) => {
          if (!controlRef?.current?.zoomTo) return;
          const currentScale = scaleRef.current;
          const newZoom = isRatio ? currentScale * val : currentScale + val;
          controlRef.current.zoomTo(newZoom);
        },
      });

      scroll.setBounds(vpm.totalHeight, h);
      scroll.attach();
      scrollRef.current = scroll;

      setLoadProgress(80);

      // 6. Initial render
      await renderVisiblePages(true);
      setIsLoading(false);
      setLoadProgress(100);
    };

    init().catch((err) => {
      console.error("[GPUPDFViewer] Init failed:", err);
      setIsLoading(false);
    });

    // Cleanup
    return () => {
      destroyed = true;
      isMountedRef.current = false;
      scrollRef.current?.detach();
      rendererRef.current?.destroy();
      cacheRef.current?.destroy();
      workerRef.current?.destroy();
      pendingRenders.current.clear();
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
    };
  }, [pdfUrl]); // Only re-init when URL changes

  // ── Resize observer ─────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        rendererRef.current?.resize(width, height);
        scrollRef.current?.setBounds(vpmRef.current?.totalHeight || 0, height);
        renderVisiblePages(false);
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [renderVisiblePages]);

  // ── Theme sync ──────────────────────────────────────────
  useEffect(() => {
    rendererRef.current?.setTheme(isDark);
  }, [isDark]);

  // ── Imperative controls (exposed to parent) ─────────────
  useEffect(() => {
    if (!controlRef) return;

    controlRef.current = {
      jumpToPage: (pageNum) => {
        const vpm = vpmRef.current;
        const scroll = scrollRef.current;
        if (!vpm || !scroll) return;
        const y = vpm.getScrollForPage(pageNum);
        scroll.scrollTo(y);
      },

      jumpToNextPage: () => {
        const next = Math.min(currentPage + 1, totalPages);
        controlRef.current?.jumpToPage(next);
      },

      jumpToPreviousPage: () => {
        const prev = Math.max(currentPage - 1, 1);
        controlRef.current?.jumpToPage(prev);
      },

      zoomTo: (newZoom) => {
        const zoom = Math.max(0.25, Math.min(5, newZoom));
        scaleRef.current = zoom;
        onScaleChange?.(zoom);

        // Instant GPU scaling
        rendererRef.current?.setZoom(zoom);

        // Update scroll bounds
        const vpm = vpmRef.current;
        if (vpm) {
          scrollRef.current?.setBounds(
            vpm.totalHeight * zoom,
            containerRef.current?.clientHeight || 800,
          );
        }

        // Debounce high-res re-render
        if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
        zoomTimerRef.current = setTimeout(() => {
          vpmRef.current?.setScale(zoom);
          scrollRef.current?.setBounds(
            vpmRef.current?.totalHeight || 0,
            containerRef.current?.clientHeight || 800,
          );
          // Update page positions
          rendererRef.current?.updateLayout((pg) =>
            vpmRef.current?.getPageRect(pg),
          );
          renderVisiblePages(true);
        }, ZOOM_SETTLE_MS);
      },

      getScale: () => scaleRef.current,
      getCurrentPage: () => currentPage,
      getTotalPages: () => totalPages,
    };
  }, [currentPage, totalPages, onScaleChange, renderVisiblePages]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ touchAction: "none", userSelect: "none" }}
      tabIndex={0}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ outline: "none" }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <div
            className={`flex flex-col items-center gap-4 p-8 rounded-2xl backdrop-blur-xl border ${
              isDark
                ? "bg-zinc-900/80 border-white/10"
                : "bg-white/80 border-gray-200"
            }`}
          >
            {/* Spinner */}
            <div className="relative w-10 h-10">
              <div
                className={`absolute inset-0 rounded-full border-2 border-t-transparent animate-spin ${
                  isDark ? "border-blue-400" : "border-blue-600"
                }`}
              />
            </div>

            <p
              className={`text-sm font-medium ${isDark ? "text-zinc-400" : "text-gray-600"}`}
            >
              Loading document…
            </p>

            {/* Progress bar */}
            <div
              className={`w-48 h-1.5 rounded-full overflow-hidden ${
                isDark ? "bg-zinc-800" : "bg-gray-200"
              }`}
            >
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Scrollbar track (custom, since we use virtual scroll) */}
      <VirtualScrollbar
        scrollY={scrollYRef.current}
        totalHeight={vpmRef.current?.totalHeight || 1}
        viewportHeight={containerRef.current?.clientHeight || 1}
        zoom={scaleRef.current}
        isDark={isDark}
        onSeek={(y) => scrollRef.current?.scrollTo(y, false)}
      />
    </div>
  );
}

// ── Virtual Scrollbar ─────────────────────────────────────
function VirtualScrollbar({
  scrollY,
  totalHeight,
  viewportHeight,
  zoom,
  isDark,
  onSeek,
}) {
  const trackRef = useRef(null);
  const [thumbTop, setThumbTop] = useState(0);
  const [thumbH, setThumbH] = useState(0);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef(null);

  useEffect(() => {
    const total = totalHeight * zoom;
    if (total <= viewportHeight) {
      setVisible(false);
      return;
    }
    const ratio = viewportHeight / total;
    const tH = Math.max(30, ratio * viewportHeight);
    const tTop = (scrollY / (total - viewportHeight)) * (viewportHeight - tH);
    setThumbTop(tTop);
    setThumbH(tH);
    setVisible(true);

    // Auto-hide
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 1500);
  }, [scrollY, totalHeight, viewportHeight, zoom]);

  if (!visible) return null;

  return (
    <div
      ref={trackRef}
      className="absolute right-1 top-0 bottom-0 w-2 z-20 pointer-events-auto"
      onMouseDown={(e) => {
        const rect = trackRef.current.getBoundingClientRect();
        const ratio = (e.clientY - rect.top) / rect.height;
        const total = totalHeight * zoom;
        onSeek?.(ratio * (total - viewportHeight));
      }}
    >
      <div
        className={`absolute right-0 w-1.5 rounded-full transition-opacity duration-300 ${
          isDark
            ? "bg-white/20 hover:bg-white/40"
            : "bg-black/20 hover:bg-black/40"
        }`}
        style={{
          top: `${thumbTop}px`,
          height: `${thumbH}px`,
        }}
      />
    </div>
  );
}
