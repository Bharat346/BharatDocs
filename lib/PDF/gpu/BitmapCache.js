/**
 * BitmapCache — LRU ImageBitmap cache with aggressive cleanup.
 *
 * Stores rendered PDF page bitmaps keyed by `pageNum:scale`.
 * Evicts oldest entries when capacity is reached.
 * Calls bitmap.close() on eviction to free memory immediately.
 */

const DEFAULT_MAX = 24;

export class BitmapCache {
  /** @param {number} maxEntries */
  constructor(maxEntries = DEFAULT_MAX) {
    this._max = maxEntries;
    /** @type {Map<string, { bitmap: ImageBitmap, width: number, height: number, scale: number, ts: number }>} */
    this._map = new Map();
  }

  /** Build a cache key */
  static key(pageNum, scale) {
    return `${pageNum}:${scale.toFixed(2)}`;
  }

  /** Check if a page/scale combo is cached */
  has(pageNum, scale) {
    return this._map.has(BitmapCache.key(pageNum, scale));
  }

  /** Get a cached entry (refreshes LRU timestamp) */
  get(pageNum, scale) {
    const k = BitmapCache.key(pageNum, scale);
    const entry = this._map.get(k);
    if (!entry) return null;
    entry.ts = performance.now();
    return entry;
  }

  /** Store a bitmap. Evicts oldest if over capacity. */
  set(pageNum, scale, bitmap, width, height) {
    const k = BitmapCache.key(pageNum, scale);

    // If replacing, close old bitmap
    const old = this._map.get(k);
    if (old?.bitmap) {
      try { old.bitmap.close(); } catch {}
    }

    this._map.set(k, { bitmap, width, height, scale, ts: performance.now() });
    this._evict();
  }

  /** Find the best cached bitmap for a page (closest scale) */
  getBestMatch(pageNum) {
    let best = null;
    let bestDiff = Infinity;
    for (const [key, entry] of this._map) {
      if (key.startsWith(`${pageNum}:`)) {
        if (!best || entry.scale > best.scale) {
          best = entry;
        }
      }
    }
    return best;
  }

  /** Remove a specific entry */
  remove(pageNum, scale) {
    const k = BitmapCache.key(pageNum, scale);
    const entry = this._map.get(k);
    if (entry?.bitmap) {
      try { entry.bitmap.close(); } catch {}
    }
    this._map.delete(k);
  }

  /** Remove all entries for a specific page */
  removePage(pageNum) {
    for (const [key, entry] of this._map) {
      if (key.startsWith(`${pageNum}:`)) {
        try { entry.bitmap.close(); } catch {}
        this._map.delete(key);
      }
    }
  }

  /** Evict oldest entries until under capacity */
  _evict() {
    while (this._map.size > this._max) {
      let oldestKey = null;
      let oldestTs = Infinity;
      for (const [key, entry] of this._map) {
        if (entry.ts < oldestTs) {
          oldestTs = entry.ts;
          oldestKey = key;
        }
      }
      if (oldestKey) {
        const entry = this._map.get(oldestKey);
        if (entry?.bitmap) {
          try { entry.bitmap.close(); } catch {}
        }
        this._map.delete(oldestKey);
      } else break;
    }
  }

  /** Destroy all cached bitmaps */
  destroy() {
    for (const [, entry] of this._map) {
      if (entry?.bitmap) {
        try { entry.bitmap.close(); } catch {}
      }
    }
    this._map.clear();
  }

  get size() { return this._map.size; }
}
