"use client";

import { useThemeContext } from "./ThemeProvider";
import { useEffect, useState } from "react";

const FLOAT_COUNT = 62;

export default function GridBackground({
  children,
  className = "",
  dotSize = 1.1,
  dotOpacity = 0.18,
  spacing = 26,
  animate = true,
}) {
  const { theme } = useThemeContext();
  const isDark = theme === "dark";

  /* ---------- COLORS ---------- */
  const baseBg = isDark ? "#0a0a0a" : "#ffffff";

  const gridDotColor = isDark
    ? `rgba(96,165,250,${dotOpacity})`
    : `rgba(37,99,235,${dotOpacity})`;

  const floatDotColor = isDark
    ? "rgba(147,197,253,0.25)"
    : "rgba(59,130,246,0.22)";

  /* ---------- FLOATING DOTS (hydration-safe) ---------- */
  const [floatDots, setFloatDots] = useState([]);

  useEffect(() => {
    const dots = Array.from({ length: FLOAT_COUNT }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 30;

      return {
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 3 + 1.5,
        duration: 5 + Math.random() * 12,
        delay: Math.random() * 6,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
      };
    });

    setFloatDots(dots);
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* ---------- BASE GRID ---------- */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          animate ? "grid-move" : ""
        }`}
        style={{
          backgroundColor: baseBg,
          backgroundImage: `radial-gradient(${gridDotColor} ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${spacing}px ${spacing}px`,
        }}
      />

      {/* ---------- RANDOM FLOATING PARTICLES ---------- */}
      {animate && (
        <div className="absolute inset-0 pointer-events-none">
          {floatDots.map((d) => (
            <span
              key={d.id}
              className="absolute rounded-full floating-dot"
              style={{
                left: `${d.left}%`,
                top: `${d.top}%`,
                width: `${d.size}px`,
                height: `${d.size}px`,
                backgroundColor: floatDotColor,
                animationDuration: `${d.duration}s`,
                animationDelay: `${d.delay}s`,
                "--dx": `${d.dx}px`,
                "--dy": `${d.dy}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* ---------- CONTENT ---------- */}
      <div className="relative z-10 w-full h-full">{children}</div>

      {/* ---------- ANIMATIONS ---------- */}
      <style jsx>{`
        @keyframes gridMove {
          from {
            background-position: 0 0;
          }
          to {
            background-position: ${spacing}px ${spacing}px;
          }
        }

        @keyframes floatDot {
          0% {
            transform: translate(0, 0);
            opacity: 0.6;
          }
          50% {
            transform: translate(var(--dx), var(--dy));
            opacity: 1;
          }
          100% {
            transform: translate(0, 0);
            opacity: 0.6;
          }
        }

        .grid-move {
          animation: gridMove 24s linear infinite;
        }

        .floating-dot {
          animation-name: floatDot;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
}
