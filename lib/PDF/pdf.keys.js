import { useEffect } from "react";

export const usePdfKeyboard = ({
  jumpToNextPage,
  jumpToPreviousPage,
  scale,
  setScale,
  zoomTo,
  toggleSidebar,
  containerRef,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target?.tagName)) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        jumpToNextPage();
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        jumpToPreviousPage();
      }

      if (e.key === "+" || (e.key === "=" && e.shiftKey)) {
        e.preventDefault();
        const next = Math.min(scale + 0.1, 3);
        setScale(next);
        zoomTo(next);
      }

      if (e.key === "-") {
        e.preventDefault();
        const next = Math.max(scale - 0.1, 0.5);
        setScale(next);
        zoomTo(next);
      }

      if (e.key === "[") {
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jumpToNextPage, jumpToPreviousPage, scale, zoomTo, toggleSidebar]);


  /* =========================
     SMOOTH PINCH TO ZOOM & 
     PREVENT BROWSER ZOOM
  ========================== */
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY;
        const direction = delta > 0 ? -1 : 1;
        const zoomStep = 0.08; // Sensitivity

        setScale((prev) => {
          const next = Math.min(
            Math.max(prev + direction * zoomStep, 0.5),
            3.5,
          );
          zoomTo(next);
          return next;
        });
      }
    };

    // Safari-specific pinch gesture prevention
    const handleGesture = (e) => {
      e.preventDefault();
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("gesturestart", handleGesture, {
      passive: false,
    });
    container.addEventListener("gesturechange", handleGesture, {
      passive: false,
    });
    container.addEventListener("gestureend", handleGesture, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("gesturestart", handleGesture);
      container.removeEventListener("gesturechange", handleGesture);
      container.removeEventListener("gestureend", handleGesture);
    };
  }, [zoomTo]);
};
