"use client";

/**
 * BackgroundEffects — minimal noise texture only.
 * No gradient orbs, no floating particles.
 */
export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[var(--bg)]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
    </div>
  );
}
