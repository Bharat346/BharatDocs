// Polyfill document for PDF.js inside the worker scope
// PDF.js fallback worker creation expects document to exist.
const mockElement = {
  append: () => {},
  appendChild: () => {},
  prepend: () => {},
  setAttribute: () => {},
  getAttribute: () => null,
  style: {},
  addEventListener: () => {},
  removeEventListener: () => {},
};

self.document = {
  currentScript: null,
  documentElement: mockElement,
  head: mockElement,
  body: mockElement,
  createElement: (name) => {
    if (name === "canvas") {
      return new OffscreenCanvas(1, 1);
    }
    return mockElement;
  },
  getElementsByTagName: () => [mockElement],
  querySelector: () => null,
  querySelectorAll: () => [],
};

// Polyfill window to self so that URL parsing works
self.window = self;

importScripts("/pdf.min.js");

const pdfjsLib = globalThis.pdfjsLib;
// Use absolute URL so nested Worker creation succeeds
pdfjsLib.GlobalWorkerOptions.workerSrc =
  self.location.origin + "/pdf.worker.min.js";

let pdfDoc = null;
let docUrl = null;
const pageCache = new Map(); // pageNum -> { bitmap, scale }

self.onmessage = async (e) => {
  const { type, id, payload } = e.data;

  try {
    switch (type) {
      case "LOAD_PDF":
        await handleLoadPDF(id, payload);
        break;
      case "RENDER_PAGE":
        await handleRenderPage(id, payload);
        break;
      case "DESTROY":
        handleDestroy(id);
        break;
        handleDestroy(id);
        break;
      default:
        respond(id, "ERROR", { error: `Unknown message type: ${type}` });
    }
  } catch (err) {
    respond(id, "ERROR", { error: err.message, stack: err.stack });
  }
};

function log(...args) {
  self.postMessage({ type: "LOG", args });
}

async function handleLoadPDF(id, { url, data }) {
  log(
    "handleLoadPDF called with url:",
    url,
    "type:",
    typeof url,
    "data:",
    data ? "present" : "absent",
  );
  // Destroy existing doc
  if (pdfDoc) {
    pdfDoc.destroy();
    pdfDoc = null;
    clearPageCache();
  }

  const loadingTask = data
    ? pdfjsLib.getDocument({ data })
    : pdfjsLib.getDocument({ url: new URL(url) });

  pdfDoc = await loadingTask.promise;
  docUrl = url;

  // Gather all page dimensions
  const pageDimensions = [];
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const vp = page.getViewport({ scale: 1.0 });
    pageDimensions.push({ width: vp.width, height: vp.height });
  }

  respond(id, "PDF_LOADED", {
    numPages: pdfDoc.numPages,
    pageDimensions,
  });
}

async function handleRenderPage(id, { pageNum, scale, priority }) {
  if (!pdfDoc) {
    respond(id, "ERROR", { error: "No PDF loaded" });
    return;
  }

  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  // Cap dimensions to prevent GPU texture limits (max 8192 or 16384)
  const MAX_DIM = 8192;
  let renderScale = scale;
  if (viewport.width > MAX_DIM || viewport.height > MAX_DIM) {
    const ratio = Math.min(MAX_DIM / viewport.width, MAX_DIM / viewport.height);
    renderScale = scale * ratio;
  }

  const finalViewport = page.getViewport({ scale: renderScale });
  const w = Math.ceil(finalViewport.width);
  const h = Math.ceil(finalViewport.height);

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d");

  await page.render({
    canvasContext: ctx,
    viewport: finalViewport,
  }).promise;

  const bitmap = canvas.transferToImageBitmap();

  respond(
    id,
    "PAGE_RENDERED",
    {
      pageNum,
      scale: renderScale,
      width: w,
      height: h,
      bitmap,
      priority,
    },
    [bitmap],
  );
}

function handleDestroy(id) {
  clearPageCache();
  if (pdfDoc) {
    pdfDoc.destroy();
    pdfDoc = null;
  }
  respond(id, "DESTROYED", {});
}

function clearPageCache() {
  for (const [, entry] of pageCache) {
    if (entry.bitmap) entry.bitmap.close();
  }
  pageCache.clear();
}

function respond(id, type, payload, transfer = []) {
  self.postMessage({ id, type, ...payload }, transfer);
}
