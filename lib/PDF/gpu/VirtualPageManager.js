/**
 * VirtualPageManager — Determines visible, preload, and unload pages.
 *
 * Tracks the scroll viewport and computes which pages should be:
 *   - VISIBLE: currently in the viewport
 *   - PRELOAD: ±N pages ahead/behind for smooth scrolling
 *   - UNLOAD:  far from viewport, should free resources
 *
 * Works with a vertical page layout where pages stack top-to-bottom.
 */

const PAGE_GAP = 12; // px gap between pages
const PRELOAD_COUNT = 2;

export class VirtualPageManager {
  /**
   * @param {{ width: number, height: number }[]} pageDimensions — base dimensions (scale=1)
   */
  constructor(pageDimensions) {
    /** Base dims at scale 1 */
    this.pageDims = pageDimensions;
    this.numPages = pageDimensions.length;
    this.scale = 1;
    this.pageGap = PAGE_GAP;

    // Layout cache (recomputed on scale change)
    /** @type {{ y: number, w: number, h: number }[]} */
    this.layout = [];
    this.totalHeight = 0;
    this.maxPageWidth = 0;

    this._computeLayout();
  }

  /** Update scale and recompute layout */
  setScale(scale) {
    if (Math.abs(this.scale - scale) < 0.001) return;
    this.scale = scale;
    this._computeLayout();
  }

  /** Compute y-offset and size for every page at current scale */
  _computeLayout() {
    this.layout = [];
    let y = this.pageGap;
    let maxW = 0;

    for (let i = 0; i < this.numPages; i++) {
      const dim = this.pageDims[i];
      const w = Math.ceil(dim.width * this.scale);
      const h = Math.ceil(dim.height * this.scale);
      this.layout.push({ y, w, h });
      if (w > maxW) maxW = w;
      y += h + this.pageGap;
    }

    this.totalHeight = y;
    this.maxPageWidth = maxW;
  }

  /**
   * Compute which pages are visible in the current viewport.
   * @param {number} scrollY — current vertical scroll offset (px)
   * @param {number} viewportH — viewport height (px)
   * @returns {{ visible: number[], preload: number[], unload: number[] }}
   *   — page numbers are 1-indexed
   */
  getVisiblePages(scrollY, viewportH) {
    const top = scrollY;
    const bottom = scrollY + viewportH;
    const visible = [];
    const preload = new Set();

    for (let i = 0; i < this.numPages; i++) {
      const pg = this.layout[i];
      const pageTop = pg.y;
      const pageBottom = pg.y + pg.h;

      // Page is visible if it overlaps the viewport
      if (pageBottom > top && pageTop < bottom) {
        visible.push(i + 1); // 1-indexed
      }
    }

    // Preload buffer pages
    if (visible.length > 0) {
      const first = visible[0];
      const last = visible[visible.length - 1];

      for (let p = Math.max(1, first - PRELOAD_COUNT); p < first; p++) {
        preload.add(p);
      }
      for (let p = last + 1; p <= Math.min(this.numPages, last + PRELOAD_COUNT); p++) {
        preload.add(p);
      }
    }

    // Remove visible from preload
    for (const v of visible) preload.delete(v);

    // Everything else is unload candidates
    const activeSet = new Set([...visible, ...preload]);
    const unload = [];
    for (let i = 1; i <= this.numPages; i++) {
      if (!activeSet.has(i)) unload.push(i);
    }

    return { visible, preload: [...preload], unload };
  }

  /**
   * Predictive prefetch based on scroll direction.
   * @param {'down'|'up'|'idle'} direction
   * @param {number[]} currentVisible — 1-indexed
   * @returns {number[]} — extra pages to prefetch (1-indexed)
   */
  getPredictivePages(direction, currentVisible) {
    if (!currentVisible.length || direction === 'idle') return [];

    const extra = [];
    if (direction === 'down') {
      const last = currentVisible[currentVisible.length - 1];
      for (let p = last + 1; p <= Math.min(this.numPages, last + PRELOAD_COUNT + 1); p++) {
        extra.push(p);
      }
    } else {
      const first = currentVisible[0];
      for (let p = Math.max(1, first - PRELOAD_COUNT - 1); p < first; p++) {
        extra.push(p);
      }
    }
    return extra;
  }

  /** Get the page rect (in virtual px) for compositing */
  getPageRect(pageNum) {
    const idx = pageNum - 1;
    if (idx < 0 || idx >= this.numPages) return null;
    return this.layout[idx];
  }

  /** Find which page a given scrollY position falls on (1-indexed, or 0 if none) */
  getPageAtScroll(scrollY) {
    for (let i = 0; i < this.numPages; i++) {
      const pg = this.layout[i];
      if (scrollY >= pg.y && scrollY < pg.y + pg.h) return i + 1;
    }
    return 0;
  }

  /** Get scroll position to bring a page into view (top-aligned) */
  getScrollForPage(pageNum) {
    const idx = pageNum - 1;
    if (idx < 0 || idx >= this.numPages) return 0;
    return Math.max(0, this.layout[idx].y - this.pageGap);
  }
}
