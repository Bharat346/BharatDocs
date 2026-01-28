"use client";

import { useThemeContext } from "./ThemeProvider";

export default function GridBackground({
  children,
  className = "",
  gridSize = 64,
  strokeWidth = 1,
  strokeOpacity = 0.1,
  dotSize = 1,
  dotOpacity = 0.15,
  showGrid = true,
  showDots = true,
  animate = false,
}) {
  const { theme } = useThemeContext();

  // Theme-based colors
  const gridColor = theme === "dark" ? "#ffffff" : "#000000";
  const dotColor = theme === "dark" ? "#ffffff" : "#000000";
  const backgroundColor = theme === "dark" 
    ? "rgba(10, 10, 10, 0.5)" 
    : "rgba(255, 255, 255, 1)";

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Grid background */}
      <div 
        className="absolute inset-0 pointer-events-none transition-colors duration-300"
        style={{ background: backgroundColor }}
      >
        {showGrid && (
          <svg
            className="absolute inset-0 w-full h-full transition-opacity duration-300"
            style={{ 
              opacity: strokeOpacity,
              backgroundImage: `radial-gradient(${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
              backgroundSize: `${gridSize}px ${gridSize}px`,
              animation: animate ? 'gridMove 20s linear infinite' : 'none',
            }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width={gridSize}
                height={gridSize}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                  fill="none"
                  stroke={gridColor}
                  strokeWidth={strokeWidth}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        )}
        
        {showDots && !showGrid && (
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: dotOpacity,
              backgroundImage: `radial-gradient(${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
              backgroundSize: `${gridSize}px ${gridSize}px`,
              animation: animate ? 'gridMove 20s linear infinite' : 'none',
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes gridMove {
          0% {
            background-position: 0px 0px;
          }
          100% {
            background-position: ${gridSize}px ${gridSize}px;
          }
        }
      `}</style>
    </div>
  );
}