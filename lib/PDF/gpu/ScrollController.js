/**
 * ScrollController — Virtual scroll with momentum, prediction, and debounce.
 *
 * Manages scroll state outside the DOM to avoid layout thrashing.
 * Provides smooth momentum scrolling on both desktop and touch.
 * Emits high-frequency scroll updates for the renderer via RAF.
 */

export class ScrollController {
  /**
   * @param {HTMLElement} container — element that receives scroll events
   * @param {object} opts
   * @param {(scrollY: number) => void} opts.onScroll
   * @param {() => void} opts.onScrollEnd — fires after debounce
   * @param {(dir: 'up'|'down'|'idle') => void} opts.onDirectionChange
   * @param {(val: number, isRatio: boolean) => void} opts.onZoom
   */
  constructor(container, { onScroll, onScrollEnd, onDirectionChange, onZoom }) {
    this.el = container;
    this._onScroll = onScroll;
    this._onScrollEnd = onScrollEnd;
    this._onDirectionChange = onDirectionChange;
    this._onZoom = onZoom;

    this.scrollY = 0;
    this.targetScrollY = 0;
    this.maxScroll = 0;
    this.velocity = 0;
    this.direction = 'idle';
    this._isAnimating = false;
    this._rafId = null;
    this._endTimer = null;
    this._lastTouchY = 0;
    this._lastTime = 0;
    this._debounceMs = 120;

    // Pinch zoom state
    this._isPinching = false;
    this._lastPinchDist = 0;

    // Bound handlers
    this._handleWheel = this._handleWheel.bind(this);
    this._handleTouchStart = this._handleTouchStart.bind(this);
    this._handleTouchMove = this._handleTouchMove.bind(this);
    this._handleTouchEnd = this._handleTouchEnd.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._tick = this._tick.bind(this);
  }

  /** Set the total scrollable height and viewport height */
  setBounds(totalHeight, viewportHeight) {
    this.maxScroll = Math.max(0, totalHeight - viewportHeight);
    this.scrollY = Math.min(this.scrollY, this.maxScroll);
    this.targetScrollY = this.scrollY;
  }

  /** Attach event listeners */
  attach() {
    this.el.addEventListener('wheel', this._handleWheel, { passive: false });
    this.el.addEventListener('touchstart', this._handleTouchStart, { passive: true });
    this.el.addEventListener('touchmove', this._handleTouchMove, { passive: false });
    this.el.addEventListener('touchend', this._handleTouchEnd, { passive: true });
    window.addEventListener('keydown', this._handleKeyDown);
  }

  /** Detach event listeners and cancel animations */
  detach() {
    this.el.removeEventListener('wheel', this._handleWheel);
    this.el.removeEventListener('touchstart', this._handleTouchStart);
    this.el.removeEventListener('touchmove', this._handleTouchMove);
    this.el.removeEventListener('touchend', this._handleTouchEnd);
    window.removeEventListener('keydown', this._handleKeyDown);
    if (this._rafId) cancelAnimationFrame(this._rafId);
    if (this._endTimer) clearTimeout(this._endTimer);
  }

  /** Jump to an exact scroll position */
  scrollTo(y, smooth = true) {
    this.targetScrollY = this._clamp(y);
    if (!smooth) {
      this.scrollY = this.targetScrollY;
      this.velocity = 0;
      this._onScroll(this.scrollY);
    }
    this._startAnimation();
  }

  /** Scroll by a delta */
  scrollBy(dy) {
    this.targetScrollY = this._clamp(this.targetScrollY + dy);
    this._startAnimation();
  }

  // ── Event Handlers ──────────────────────────────────────

  _handleWheel(e) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY;
      const dir = delta > 0 ? -1 : 1;
      const step = 0.08;
      this._onZoom?.(dir * step, false);
      return;
    }

    e.preventDefault();

    const dy = e.deltaY;
    const dir = dy > 0 ? 'down' : dy < 0 ? 'up' : this.direction;
    this._updateDirection(dir);

    this.targetScrollY = this._clamp(this.targetScrollY + dy);
    this._startAnimation();
    this._scheduleEnd();
  }

  _handleTouchStart(e) {
    if (e.touches.length === 2) {
      this._isPinching = true;
      this._lastPinchDist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      return;
    }
    
    this._isPinching = false;
    if (!e.touches.length) return;
    this._lastTouchY = e.touches[0].clientY;
    this._lastTime = performance.now();
    this.velocity = 0;
  }

  _handleTouchMove(e) {
    if (this._isPinching && e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      if (this._lastPinchDist > 0) {
        this._onZoom?.(dist / this._lastPinchDist, true);
      }
      this._lastPinchDist = dist;
      return;
    }

    if (!e.touches.length || e.touches.length > 1) return;
    e.preventDefault();

    const touchY = e.touches[0].clientY;
    const now = performance.now();
    const dy = this._lastTouchY - touchY;
    const dt = now - this._lastTime;

    if (dt > 0) this.velocity = dy / dt * 16; // normalize to ~60fps frame

    const dir = dy > 0 ? 'down' : dy < 0 ? 'up' : this.direction;
    this._updateDirection(dir);

    this.scrollY = this._clamp(this.scrollY + dy);
    this.targetScrollY = this.scrollY;
    this._onScroll(this.scrollY);

    this._lastTouchY = touchY;
    this._lastTime = now;
    this._scheduleEnd();
  }

  _handleTouchEnd(e) {
    if (this._isPinching) {
      if (e.touches.length < 2) {
        this._isPinching = false;
      }
      return;
    }

    // Momentum: apply velocity decay
    if (Math.abs(this.velocity) > 0.5) {
      this.targetScrollY = this._clamp(this.scrollY + this.velocity * 20);
      this._startAnimation();
    }
    this._scheduleEnd();
  }

  _handleKeyDown(e) {
    if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;

    const PAGE_STEP = this.el.clientHeight * 0.85;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.scrollBy(60);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.scrollBy(-60);
        break;
      case 'PageDown':
      case ' ':
        e.preventDefault();
        this.scrollBy(PAGE_STEP);
        break;
      case 'PageUp':
        e.preventDefault();
        this.scrollBy(-PAGE_STEP);
        break;
      case 'Home':
        e.preventDefault();
        this.scrollTo(0);
        break;
      case 'End':
        e.preventDefault();
        this.scrollTo(this.maxScroll);
        break;
    }
    this._scheduleEnd();
  }

  // ── Animation Loop ──────────────────────────────────────

  _startAnimation() {
    if (this._isAnimating) return;
    this._isAnimating = true;
    this._rafId = requestAnimationFrame(this._tick);
  }

  _tick() {
    const diff = this.targetScrollY - this.scrollY;

    if (Math.abs(diff) < 0.5) {
      this.scrollY = this.targetScrollY;
      this._isAnimating = false;
      this._onScroll(this.scrollY);
      return;
    }

    // Exponential easing — snappy feel
    this.scrollY += diff * 0.18;
    this._onScroll(this.scrollY);

    this._rafId = requestAnimationFrame(this._tick);
  }

  // ── Helpers ─────────────────────────────────────────────

  _clamp(v) {
    return Math.max(0, Math.min(this.maxScroll, v));
  }

  _updateDirection(dir) {
    if (dir !== this.direction) {
      this.direction = dir;
      this._onDirectionChange?.(dir);
    }
  }

  _scheduleEnd() {
    if (this._endTimer) clearTimeout(this._endTimer);
    this._endTimer = setTimeout(() => {
      this._updateDirection('idle');
      this._onScrollEnd?.();
    }, this._debounceMs);
  }
}
