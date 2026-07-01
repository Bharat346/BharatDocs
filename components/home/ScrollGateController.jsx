"use client";

// The ScrollGateController is no longer needed globally because we implemented 
// a native CSS sticky-based scroll gate inside RecentDocs.jsx for perfect physics.
// We keep this as a simple pass-through to avoid breaking imports.
export default function ScrollGateController({ children }) {
  return <>{children}</>;
}
