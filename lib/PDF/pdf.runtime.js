export const PDF_RENDER_CONCURRENCY =
  typeof navigator !== "undefined"
    ? Math.min(navigator.hardwareConcurrency || 2, 3)
    : 4;
