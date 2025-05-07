import { useState, useEffect } from "react";

export const useScrollProgress = (options) => {
  const { 
    smoothness = 0.1, 
    delay = 16, 
    decimalPoints = 1 
  } = options || {};
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const [targetProgress, setTargetProgress] = useState(0);

  useEffect(() => {
    let animationFrameId;
    let timeoutId;
    let currentProgress = 0;

    const calculateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      return docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    };

    const updateProgress = () => {
      // Easing function - exponential decay
      currentProgress += (targetProgress - currentProgress) * smoothness;
      
      const rounded = parseFloat(currentProgress.toFixed(decimalPoints));
      setScrollProgress(rounded);

      if (Math.abs(targetProgress - currentProgress) > 0.05) {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    const handleScroll = () => {
      // Update target immediately
      setTargetProgress(calculateProgress());

      // Clear any pending updates
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);

      // Start smooth update after a small delay
      timeoutId = setTimeout(() => {
        animationFrameId = requestAnimationFrame(updateProgress);
      }, delay);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial setup
    setTargetProgress(calculateProgress());
    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
    };
  }, [smoothness, delay, decimalPoints]);

  return scrollProgress;
};