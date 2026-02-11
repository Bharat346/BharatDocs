"use client";

import { useThemeContext } from "./ThemeProvider";
import { useEffect, useMemo, useState } from "react";
import {
  allowHeavyAnimations,
  getNetworkTier,
  getDeviceMemoryTier,
} from "@/lib/network/network.config";

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

  /* ----------------------------------
     PERFORMANCE DECISION (ONCE)
  ----------------------------------- */

  const animationPolicy = useMemo(() => {
    if (typeof window === "undefined") return false;
    if (!animate) return false;

    // Accessibility first
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return false;

    if (!allowHeavyAnimations()) return false;

    return true;
  }, [animate]);

  /* ----------------------------------
     DYNAMIC FLOAT COUNT
  ----------------------------------- */

  const floatCount = useMemo(() => {
    if (!animationPolicy) return 0;

    const networkTier = getNetworkTier();
    const memoryTier = getDeviceMemoryTier();

    if (networkTier === "moderate") return 24;
    if (memoryTier === "mid") return 32;

    return 62; // full effect
  }, [animationPolicy]);

  /* ----------------------------------
     COLORS
  ----------------------------------- */

  const baseBg = isDark ? "#0a0a0a" : "#ffffff";

  const gridDotColor = isDark
    ? `rgba(96,165,250,${dotOpacity})`
    : `rgba(37,99,235,${dotOpacity})`;

  const floatDotColor = isDark
    ? "rgba(147,197,253,0.25)"
    : "rgba(59,130,246,0.22)";

  /* ----------------------------------
     FLOATING DOTS
  ----------------------------------- */

  const [floatDots, setFloatDots] = useState([]);

  useEffect(() => {
    if (!animationPolicy) return;

    const dots = Array.from({ length: floatCount }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 30;

      return {
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 3 + 1.5,
        duration: 6 + Math.random() * 10,
        delay: Math.random() * 5,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
      };
    });

    setFloatDots(dots);
  }, [animationPolicy, floatCount]);

  /* ----------------------------------
     PAUSE WHEN TAB HIDDEN
  ----------------------------------- */

  useEffect(() => {
    if (!animationPolicy) return;

    const handleVisibility = () => {
      document.documentElement.style.setProperty(
        "--animation-state",
        document.hidden ? "paused" : "running"
      );
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [animationPolicy]);

  /* ----------------------------------
     RENDER
  ----------------------------------- */

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Base Grid */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          animationPolicy ? "grid-move" : ""
        }`}
        style={{
          backgroundColor: baseBg,
          backgroundImage: `radial-gradient(${gridDotColor} ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${spacing}px ${spacing}px`,
        }}
      />

      {/* Floating Dots */}
      {animationPolicy && floatDots.length > 0 && (
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

      {/* Content */}
      <div className="relative z-10 w-full h-full">{children}</div>

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
          animation-play-state: var(--animation-state, running);
        }

        .floating-dot {
          animation-name: floatDot;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-play-state: var(--animation-state, running);
        }
      `}</style>
    </div>
  );
}
