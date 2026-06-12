/**
 * PDFWorkerManager — Manages the PDF render Web Worker.
 *
 * Sends render requests and routes responses back via Promises.
 * Handles load, render, tile, and cleanup lifecycle.
 */

export class PDFWorkerManager {
  constructor() {
    this._worker = null;
    this._nextId = 1;
    /** @type {Map<number, { resolve: Function, reject: Function }>} */
    this._pending = new Map();
    this._isLoaded = false;
    /** @type {{ width: number, height: number }[] | null} */
    this.pageDimensions = null;
    this.numPages = 0;
  }

  /** Initialize the worker */
  init() {
    if (this._worker) return;
    this._worker = new Worker(`/pdf-render-worker.js?v=${Date.now()}`);
    this._worker.onmessage = (e) => this._onMessage(e);
    this._worker.onerror = (e) => {
      console.error("[PDFWorkerManager] Worker error:", e);
    };
  }

  /** Load a PDF document */
  async loadPDF(url) {
    console.log(
      "[PDFWorkerManager] loadPDF called with url:",
      url,
      "type:",
      typeof url,
    );
    this.init();

    // If URL is relative, make it absolute for the worker
    let absoluteUrl = url;
    if (url && typeof url === "string" && url.startsWith("/")) {
      absoluteUrl = `${location.origin}${url}`;
    }

    console.log(
      "[PDFWorkerManager] Sending LOAD_PDF with absoluteUrl:",
      absoluteUrl,
    );
    const result = await this._send("LOAD_PDF", { url: absoluteUrl });
    this._isLoaded = true;
    this.numPages = result.numPages;
    this.pageDimensions = result.pageDimensions;
    return result;
  }

  /** Load PDF from ArrayBuffer */
  async loadPDFData(data) {
    this.init();
    const result = await this._send("LOAD_PDF", { data }, [data]);
    this._isLoaded = true;
    this.numPages = result.numPages;
    this.pageDimensions = result.pageDimensions;
    return result;
  }

  /**
   * Request a full page render.
   * @param {number} pageNum — 1-indexed
   * @param {number} scale
   * @param {'high'|'low'} priority
   * @returns {Promise<{ bitmap: ImageBitmap, width: number, height: number, pageNum: number, scale: number }>}
   */
  renderPage(pageNum, scale, priority = "high") {
    return this._send("RENDER_PAGE", { pageNum, scale, priority });
  }

  /** Clean up */
  destroy() {
    if (this._worker) {
      this._send("DESTROY", {}).catch(() => {});
      setTimeout(() => {
        this._worker?.terminate();
        this._worker = null;
      }, 200);
    }
    this._pending.clear();
    this._isLoaded = false;
    this.pageDimensions = null;
    this.numPages = 0;
  }

  get isLoaded() {
    return this._isLoaded;
  }

  // ── Internal ────────────────────────────────────────────

  _send(type, payload, transfer = []) {
    return new Promise((resolve, reject) => {
      const id = this._nextId++;
      this._pending.set(id, { resolve, reject });
      this._worker.postMessage({ type, id, payload }, transfer);
    });
  }

  _onMessage(e) {
    const { id, type, error, ...payload } = e.data;
    if (type === "LOG") {
      console.log(`[Worker Log]`, ...payload.args);
      return;
    }
    const handler = this._pending.get(id);
    if (!handler) return;
    this._pending.delete(id);

    if (type === "ERROR") {
      handler.reject(new Error(error || "Worker error"));
    } else {
      handler.resolve(payload);
    }
  }
}
