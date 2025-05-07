import React, { useEffect, useRef } from 'react';
import { pdfjs } from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

const PdfViewer = ({ fileUrl, onClose, isDark }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const renderPDF = async () => {
      const loadingTask = pdfjs.getDocument(fileUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    };

    renderPDF();
  }, [fileUrl]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isDark ? 'bg-black bg-opacity-90' : 'bg-black bg-opacity-60'
      }`}
    >
      <div
        className={`relative p-4 rounded shadow-lg max-w-[90%] max-h-[90%] overflow-auto ${
          isDark ? 'bg-gray-900 text-white' : 'bg-white text-black'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow ${
            isDark ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          ×
        </button>
        <canvas ref={canvasRef} className="block mx-auto" />
      </div>
    </div>
  );
};

export default PdfViewer;
