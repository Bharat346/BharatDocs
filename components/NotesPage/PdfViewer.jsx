"use client";

import { useState } from "react";

const PdfViewer = ({ url }) => {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100); // %

  if (!url) return null;

  const iframeSrc = `${url}#page=${page}&zoom=${zoom}`;

  const next = () => setPage((p) => p + 1);
  const prev = () => setPage((p) => Math.max(1, p - 1));

  const zoomIn = () => setZoom((z) => Math.min(z + 10, 200));
  const zoomOut = () => setZoom((z) => Math.max(z - 10, 50));

  return (
    <div style={styles.viewer} className="z-999999999">

      {/* Iframe */}
      <iframe
        src={iframeSrc}
        style={styles.iframe}
        title="PDF Viewer"
      />
    </div>
  );
};

export default PdfViewer;

/* ---------------- Styles ---------------- */

const styles = {
  viewer: {
    width: "100%",
    height: "100vh",
    background: "#020617",
    display: "flex",
    flexDirection: "column",
  },
  toolbar: {
    height: "48px",
    background: "#020617",
    borderBottom: "1px solid #1e293b",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 16px",
    color: "#e5e7eb",
  },
  iframe: {
    flex: 1,
    width: "100%",
    border: "none",
    background: "#0f172a",
  },
};
