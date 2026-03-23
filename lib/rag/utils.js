import { createCanvas } from "canvas";
import path from "path";
import { createWorker, createScheduler } from "tesseract.js";
import { franc } from "franc-min";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

let pdfjsLib = null;

/**
 * Load PDF.js (Node.js safe)
 */
function getPdfJs() {
  if (!pdfjsLib) {
    pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

    const workerPath = path.join(
      process.cwd(),
      "node_modules",
      "pdfjs-dist",
      "legacy",
      "build",
      "pdf.worker.js",
    );

    pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
    pdfjsLib.GlobalWorkerOptions.disableEval = true;
  }
  return pdfjsLib;
}

/**
 * Detect language (eng / hin)
 */
function detectLanguage(text) {
  if (!text || text.length < 50) return "eng";

  const lang = franc(text);
  if (lang === "hin") return "hin";

  return "eng";
}

/**
 * STEP 1: Try extracting text directly
 */
async function extractTextDirect(arrayBuffer) {
  try {
    const data = await pdfParse(Buffer.from(arrayBuffer));
    const text = data.text?.trim();

    if (text && text.length > 100) {
      const lang = detectLanguage(text);

      console.log("[PDF] Direct extraction success ✅");
      console.log(`[Language] Detected: ${lang}`);

      return { text, lang };
    }
  } catch (err) {
    console.warn("[PDF] Direct extraction failed:", err.message);
  }

  return null;
}

/**
 * STEP 2: OCR (FIXED)
 */
async function extractTextWithOCR(arrayBuffer, detectedLang = "eng+hin") {
  const uint8Array = new Uint8Array(arrayBuffer);
  const pdfjs = getPdfJs();

  const pdfDoc = await pdfjs.getDocument({
    data: uint8Array,
    disableWorker: true,
  }).promise;

  // 🔥 Smart language handling
  let LANG = detectedLang;
  if (!LANG || (LANG !== "eng" && LANG !== "hin")) {
    LANG = "eng+hin";
  }

  console.log(`[OCR] Using language: ${LANG}`);
  console.log(`[OCR] Total pages: ${pdfDoc.numPages}`);

  const scheduler = createScheduler();
  const WORKERS = Math.min(2, pdfDoc.numPages);

  // ✅ FIX: Correct worker creation (v4+)
  for (let i = 0; i < WORKERS; i++) {
    const worker = await createWorker(LANG);
    scheduler.addWorker(worker);
  }

  const results = [];
  const SCALE = 3.5;

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: SCALE });

      const canvas = createCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext("2d");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      await page.render({ canvasContext: ctx, viewport }).promise;

      const imageBuffer = canvas.toBuffer("image/png");

      const {
        data: { text },
      } = await scheduler.addJob("recognize", imageBuffer, {
        tessedit_pageseg_mode: 6,
      });

      console.log(`[OCR] Page ${pageNum} done`);

      results.push(text);

      // Cleanup
      canvas.width = 0;
      canvas.height = 0;
    } catch (err) {
      console.error(`[OCR Error] Page ${pageNum}:`, err.message);
      results.push("");
    }
  }

  await scheduler.terminate();

  return results.join("\n\n");
}

/**
 * MAIN FUNCTION
 */
export async function extractTextFromPDF(arrayBuffer) {
  const direct = await extractTextDirect(arrayBuffer);

  // ✅ If text-based PDF → return directly
  if (direct) {
    return direct.text;
  }

  console.log("[PDF] Scanned PDF → using OCR");

  // ❗ Scanned PDFs → safest option
  return await extractTextWithOCR(arrayBuffer, "eng+hin");
}

/**
 * RAG Chunking
 */
export function chunkText(text, chunkSize = 1500, overlap = 200) {
  if (!text) return [];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    if (end < text.length) {
      const space = text.lastIndexOf(" ", end);
      const newline = text.lastIndexOf("\n", end);
      const best = Math.max(space, newline);

      if (best > start + chunkSize * 0.7) {
        end = best;
      }
    }

    const chunk = text.slice(start, end).trim();

    if (chunk.length > 20) {
      chunks.push(chunk);
    }

    start = end - overlap;
    if (start < 0) start = 0;
    if (end >= text.length) break;
  }

  return chunks;
}
