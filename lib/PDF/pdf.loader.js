import { useEffect, useState } from "react";

export const usePdfLoader = (fileUrl) => {
  const [pdfSource, setPdfSource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!fileUrl) return;

    // Use direct fileUrl to allow pdf.js range requests and progressive loading.
    // Fetching entire blob was causing delays for large files.
    setPdfSource(fileUrl);
    setIsLoading(false);

  }, [fileUrl]);

  return { pdfSource, isLoading };
};