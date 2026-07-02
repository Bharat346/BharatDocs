"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_CACHE } from "@/components/providers/QueryProvider";
import Link from "next/link";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications").then((res) => res.json()),
    ...QUERY_CACHE.notifications,
  });

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl transition-all bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--fg-secondary)] hover:text-[var(--primary)] hover:border-[var(--border-hover)]"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse-glow" />
        )}
      </button>

      <div
        className={`absolute sm:-right-4 right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] sm:glass bg-[var(--bg)] sm:bg-transparent rounded-2xl shadow-lg border border-[var(--border)] sm:border-[var(--glass-border)] overflow-hidden z-[110] transition-all duration-200 origin-top-right ${
          isOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"
        }`}
      >
        <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
          <h3 className="font-bold text-[var(--fg)]">Notifications</h3>
        </div>

        <div className="max-h-96 overflow-y-auto no-scrollbar">
          {notifications.length > 0 ? (
            <div className="divide-y divide-[var(--border)]">
              {notifications.map((note) => {
                const Content = () => (
                  <div className="flex gap-3 p-4 hover:bg-[var(--bg-tertiary)] transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      <Info className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--fg)]">{note.title}</p>
                      {note.message && (
                        <p className="text-xs text-[var(--fg-muted)] mt-1 line-clamp-2">
                          {note.message}
                        </p>
                      )}
                      <p className="text-[10px] text-[var(--fg-muted)] mt-2">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );

                return note.url ? (
                  <Link key={note.id} href={note.url} onClick={() => setIsOpen(false)}>
                    <Content />
                  </Link>
                ) : (
                  <div key={note.id}><Content /></div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-[var(--fg-muted)]">
              <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No new notifications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
