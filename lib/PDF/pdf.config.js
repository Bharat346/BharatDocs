import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.disableEval = true;
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerPort =
    pdfjsLib.GlobalWorkerOptions.workerPort ||
    new pdfjsLib.PDFWorker({ name: "pdfjs-worker" });
}


export { pdfjsLib };
