"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X, Check, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserProfileStore } from "@/hooks/useUserProfile";
import Link from "next/link";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const store = useUserProfileStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2.5 rounded-xl bg-secondary-bg border border-border/50 text-neutral-500">
        <Bell className="w-5 h-5" />
      </button>
    );
  }

  const recentNotifs = store.notificationItems.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl transition-all flex bg-secondary-bg border border-border/50 text-neutral-500 hover:text-primary hover:border-primary/30"
      >
        <Bell className="w-5 h-5" />
        {store.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
            {store.unreadCount > 9 ? "9+" : store.unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed sm:absolute inset-x-4 sm:inset-auto sm:right-0 top-16 sm:top-full mt-3 sm:w-[380px] rounded-[1.5rem] border border-border bg-background shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[200] overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/50">
                Notifications
              </h4>
              <div className="flex items-center gap-2">
                {store.unreadCount > 0 && (
                  <button
                    onClick={() => store.markAllRead()}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground/20 hover:text-foreground/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[300px] overflow-y-auto no-scrollbar">
              {recentNotifs.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-foreground/10" />
                  <p className="text-xs text-foreground/25 font-medium">
                    No notifications
                  </p>
                </div>
              ) : (
                recentNotifs.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-5 py-3.5 border-b border-border/50 last:border-0 transition-colors ${
                      notif.read
                        ? "bg-transparent"
                        : "bg-primary/[0.03]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {notif.title}
                      </p>
                      {notif.message && (
                        <p className="text-[10px] text-foreground/30 truncate mt-0.5">
                          {notif.message}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-[9px] text-foreground/15 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(notif.timestamp).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {notif.url && (
                          <Link
                            href={notif.url}
                            onClick={() => {
                              store.markRead(notif.id);
                              setIsOpen(false);
                            }}
                            className="px-2 py-1 rounded-md bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider hover:bg-primary/20 transition-colors"
                          >
                            View
                          </Link>
                        )}
                      </div>
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center text-xs font-bold text-primary hover:underline"
              >
                View all → Profile
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
