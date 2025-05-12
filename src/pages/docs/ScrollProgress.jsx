import { useState, useEffect } from "react";

export const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let animationFrame;
    const updateScrollProgress = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        setScrollProgress(progress);
      });
    };

    window.addEventListener("scroll", updateScrollProgress);
    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return scrollProgress;
};

export const ScrollProgress = ({ progress }) => {
  return (
    <div
      className="fixed top-0 left-0 h-1 z-50 bg-blue-500 transition-all duration-200"
      style={{ width: `${progress}%` }}
    />
  );
};