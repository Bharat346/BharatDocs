import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.disableEval = true;
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export { pdfjsLib };
