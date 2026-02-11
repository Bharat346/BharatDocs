let workerInstance = null;

export function initPdfWorker() {
  if (typeof window === "undefined") return;

  if (!workerInstance) {
    const pdfjsLib = require("pdfjs-dist");

    pdfjsLib.GlobalWorkerOptions.disableEval = true;
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

    workerInstance = new pdfjsLib.PDFWorker({
      name: "pdfjs-worker",
    });

    pdfjsLib.GlobalWorkerOptions.workerPort = workerInstance;
  }

  return workerInstance;
}

export function initPdfWorkerIdle() {
  if (typeof window === "undefined") return;

  const ric =
    window.requestIdleCallback ??
    ((cb) => setTimeout(cb, 200));

  ric(() => initPdfWorker());
}
