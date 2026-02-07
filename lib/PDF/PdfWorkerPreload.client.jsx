"use client";

import { useEffect } from "react";

export default function PdfWorkerPreload() {
  useEffect(() => {
    if (document.querySelector('link[href="/pdf.worker.min.js"]')) return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "script";
    link.href = "/pdf.worker.min.js";

    document.head.appendChild(link);
  }, []);

  return null;
}
