import { useState, useEffect } from "react";

const [scrollProgress, setScrollProgress] = useState(0);

useEffect(() => {
  const updateScrollProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    setScrollProgress(progress);
  };

  window.addEventListener("scroll", updateScrollProgress);
  return () => window.removeEventListener("scroll", updateScrollProgress);
}, []);
