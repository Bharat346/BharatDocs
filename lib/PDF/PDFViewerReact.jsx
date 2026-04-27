"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { saveAs } from "file-saver";
import { Loader2, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
// import "react-pdf/dist/esm/Page/AnnotationLayer.css";
// import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewerReact({ fileUrl, docTitle }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  const handleDownload = () => {
    saveAs(fileUrl, `${docTitle || "document"}.pdf`);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
            disabled={pageNumber <= 1}
            className="p-2 hover:bg-zinc-800 rounded-lg disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium">
            Page {pageNumber} of {numPages || "?"}
          </span>
          <button
            onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || prev))}
            disabled={pageNumber >= numPages}
            className="p-2 hover:bg-zinc-800 rounded-lg disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(prev => Math.max(prev - 0.2, 0.5))}
            className="p-2 hover:bg-zinc-800 rounded-lg"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(prev => Math.min(prev + 0.2, 3.0))}
            className="p-2 hover:bg-zinc-800 rounded-lg"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-zinc-800 mx-2" />
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* PDF Container */}
      <div className="flex-1 overflow-auto p-4 flex justify-center custom-scrollbar">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-zinc-500 animate-pulse">Loading document...</p>
            </div>
          }
          error={
            <div className="text-red-500 p-8 text-center">
              Failed to load PDF. Please check the URL or try again later.
            </div>
          }
          options={{
            cMapUrl: 'cmaps/',
            cMapPacked: true,
            httpRangeRequests: true, // Enable range requests as requested
          }}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            loading={null}
            renderAnnotationLayer={true}
            renderTextLayer={true}
            className="shadow-2xl"
          />
        </Document>
      </div>
    </div>
  );
}
