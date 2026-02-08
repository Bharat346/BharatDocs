// docs.slug.panel.js
"use client";

export default function Panel({ open, mobile, side, panelRef, children }) {
  if (!open) return null;

  /* ---------- Mobile Overlay ---------- */
  if (mobile) {
    return (
      <div
        ref={panelRef}
        className={`fixed inset-y-0 ${
          side === "right" ? "right-0" : "left-0"
        } z-40 w-72 bg-background shadow-xl`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    );
  }

  /* ---------- Desktop ---------- */
  return (
    <aside className="hidden lg:block w-72 h-full">
      {children}
    </aside>
  );
}
