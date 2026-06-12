/**
 * PixiRenderer — Single-canvas GPU compositor using PixiJS v8.
 *
 * Architecture:
 *   ONE <canvas> → PixiJS Application → Container (viewport)
 *     └─ Sprite per visible page (texture from ImageBitmap)
 *
 * Features:
 *   - WebGPU primary, WebGL2 fallback (automatic)
 *   - GPU texture compositing (no DOM repaints)
 *   - GPU scaling for instant zoom (no re-render)
 *   - LRU texture eviction (max 8 textures in VRAM)
 *   - Smooth transform-based scrolling
 *   - Background color & page shadow rendering
 */

import { Application, Container, Sprite, Texture, Graphics } from 'pixi.js';

const MAX_GPU_TEXTURES = 8;

export class PixiRenderer {
  constructor() {
    /** @type {Application | null} */
    this.app = null;
    /** @type {Container | null} */
    this.viewport = null;

    /** Active page sprites — pageNum → { sprite, texture, shadow } */
    this._pages = new Map();

    /** LRU texture tracker — pageNum:scale → { texture, ts } */
    this._textures = new Map();

    this._scrollY = 0;
    this._zoom = 1;
    this._viewW = 0;
    this._viewH = 0;
    this._isDark = false;
    this._isReady = false;
  }

  /**
   * Initialize PixiJS application on a canvas element.
   * @param {HTMLCanvasElement} canvas
   * @param {number} width
   * @param {number} height
   * @param {boolean} isDark
   */
  async init(canvas, width, height, isDark = false) {
    this._viewW = width;
    this._viewH = height;
    this._isDark = isDark;

    this.app = new Application();
    await this.app.init({
      canvas,
      width,
      height,
      backgroundColor: isDark ? 0x0a0a0a : 0xe5e7eb,
      antialias: false,           // Not needed for raster pages
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      preference: 'webgpu',       // Prefer WebGPU, fallback to WebGL2
      powerPreference: 'high-performance',
    });

    // Disable auto-rendering — we control the render loop
    this.app.ticker.autoStart = false;
    this.app.ticker.stop();

    // Create viewport container
    this.viewport = new Container();
    this.viewport.label = 'pdf-viewport';
    this.app.stage.addChild(this.viewport);

    this._isReady = true;
  }

  get isReady() { return this._isReady; }
  get rendererType() {
    return this.app?.renderer?.type ?? 'unknown';
  }

  /** Update canvas size on window resize */
  resize(w, h) {
    if (!this.app) return;
    this._viewW = w;
    this._viewH = h;
    this.app.renderer.resize(w, h);
    this.render();
  }

  /** Set theme */
  setTheme(isDark) {
    this._isDark = isDark;
    if (this.app) {
      this.app.renderer.background.color = isDark ? 0x0a0a0a : 0xe5e7eb;
    }
    // Update shadows
    for (const [, entry] of this._pages) {
      if (entry.shadow) {
        this._drawShadow(entry.shadow, entry.sprite.width, entry.sprite.height);
      }
    }
    this.render();
  }

  /**
   * Set/update a page's texture from an ImageBitmap.
   * @param {number} pageNum — 1-indexed
   * @param {ImageBitmap} bitmap
   * @param {{ y: number, w: number, h: number }} rect — layout rect
   * @param {number} maxPageWidth — for centering
   */
  setPageBitmap(pageNum, bitmap, rect, maxPageWidth) {
    if (!this.app || !this.viewport) return;

    // Create texture from bitmap
    const texture = Texture.from({ resource: bitmap, antialias: false });
    this._trackTexture(pageNum, texture);

    let entry = this._pages.get(pageNum);

    if (!entry) {
      // Create shadow
      const shadow = new Graphics();
      this.viewport.addChild(shadow);

      // Create sprite
      const sprite = new Sprite(texture);
      this.viewport.addChild(sprite);

      entry = { sprite, texture, shadow, rect };
      this._pages.set(pageNum, entry);
    } else {
      // Update existing sprite texture
      entry.sprite.texture = texture;
      entry.texture = texture;
      entry.rect = rect;
    }

    // Position and scale the sprite
    const centerX = (this._viewW / this._zoom - rect.w) / 2;
    entry.sprite.x = Math.max(12, centerX);
    entry.sprite.y = rect.y;
    entry.sprite.width = rect.w;
    entry.sprite.height = rect.h;

    // Draw shadow behind
    this._drawShadow(entry.shadow, rect.w, rect.h);
    entry.shadow.x = entry.sprite.x;
    entry.shadow.y = rect.y;

    this.render();
  }

  /**
   * Remove a page's sprite and free its texture.
   * @param {number} pageNum
   */
  removePage(pageNum) {
    const entry = this._pages.get(pageNum);
    if (!entry) return;

    this.viewport.removeChild(entry.sprite);
    this.viewport.removeChild(entry.shadow);
    entry.sprite.destroy();
    entry.shadow.destroy();
    this._pages.delete(pageNum);
  }

  /** Remove all pages not in the given set */
  retainOnly(activePageNums) {
    const activeSet = new Set(activePageNums);
    for (const [pageNum] of this._pages) {
      if (!activeSet.has(pageNum)) {
        this.removePage(pageNum);
      }
    }
  }

  /**
   * Update scroll position (moves viewport container).
   * This is a pure GPU transform — zero repainting.
   */
  setScroll(scrollY) {
    this._scrollY = scrollY;
    if (this.viewport) {
      this.viewport.y = -scrollY * this._zoom;
    }
    this.render();
  }

  /**
   * Update zoom level (scales viewport container).
   * GPU-only transform — no re-rendering needed.
   */
  setZoom(zoom) {
    this._zoom = zoom;
    if (this.viewport) {
      this.viewport.scale.set(zoom, zoom);
      this.viewport.y = -this._scrollY * zoom;
    }
    this.render();
  }

  /** Reposition all pages (e.g., after scale change) */
  updateLayout(layoutFn) {
    for (const [pageNum, entry] of this._pages) {
      const rect = layoutFn(pageNum);
      if (!rect) continue;
      entry.rect = rect;
      const centerX = (this._viewW / this._zoom - rect.w) / 2;
      entry.sprite.x = Math.max(12, centerX);
      entry.sprite.y = rect.y;
      entry.sprite.width = rect.w;
      entry.sprite.height = rect.h;
      entry.shadow.x = entry.sprite.x;
      entry.shadow.y = rect.y;
      this._drawShadow(entry.shadow, rect.w, rect.h);
    }
    this.render();
  }

  /** Manual render (call from RAF loop) */
  render() {
    if (!this.app?.renderer) return;
    this.app.render();
  }

  /** Clean up everything */
  destroy() {
    for (const [pageNum] of this._pages) {
      this.removePage(pageNum);
    }
    for (const [, entry] of this._textures) {
      try { entry.texture.destroy(true); } catch {}
    }
    this._textures.clear();
    this._pages.clear();

    if (this.app) {
      this.app.destroy(true, { children: true, texture: true });
      this.app = null;
    }
    this.viewport = null;
    this._isReady = false;
  }

  // ── Private ─────────────────────────────────────────────

  _drawShadow(gfx, w, h) {
    gfx.clear();
    // Page background
    gfx.rect(0, 0, w, h);
    gfx.fill({ color: 0xffffff });
    // Subtle shadow
    gfx.rect(-2, -2, w + 4, h + 4);
    gfx.stroke({
      color: this._isDark ? 0x1a1a2e : 0xc0c0c0,
      width: 1,
      alpha: 0.3,
    });
  }

  _trackTexture(pageNum, texture) {
    const key = `${pageNum}`;
    this._textures.set(key, { texture, ts: performance.now() });
    this._evictTextures();
  }

  _evictTextures() {
    while (this._textures.size > MAX_GPU_TEXTURES) {
      let oldestKey = null;
      let oldestTs = Infinity;
      for (const [key, entry] of this._textures) {
        // Don't evict if the page is currently displayed
        const pageNum = parseInt(key);
        if (this._pages.has(pageNum)) continue;
        if (entry.ts < oldestTs) {
          oldestTs = entry.ts;
          oldestKey = key;
        }
      }
      if (oldestKey) {
        const entry = this._textures.get(oldestKey);
        try { entry.texture.destroy(true); } catch {}
        this._textures.delete(oldestKey);
      } else break; // all textures are active, can't evict
    }
  }
}
