"use client";

import { useEffect, useState } from "react";
import { useUserProfileStore } from "@/hooks/useUserProfile";

export default function NotificationManager() {
  const store = useUserProfileStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !store._hasHydrated) {
      console.log("[NotificationManager] Waiting for hydration or mount...", { isMounted, hydrated: store._hasHydrated });
      return;
    }

    console.log("[NotificationManager] System Active. Polling initialized.");

    // Request Notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        console.log("[NotificationManager] Requesting permission...");
        Notification.requestPermission();
      }
    }

    const checkNotifications = async () => {
      try {
        const state = useUserProfileStore.getState();
        
        // Final guard
        if (!state._hasHydrated || !state.notifications.enabled) {
          console.log("[NotificationManager] Polling skipped: notifications disabled or not hydrated.");
          return;
        }

        console.log("[NotificationManager] Fetching updates...");
        const res = await fetch("/api/notifications");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
        if (!Array.isArray(data)) {
          console.error("[NotificationManager] Invalid data format received:", data);
          return;
        }

        console.log(`[NotificationManager] Received ${data.length} notifications from API.`);

        // Filter according to user preference
        const filtered = data.filter((notif) => {
          const anyPreferenceSet = Object.values(state.contentPreferences).some(v => v);
          if (anyPreferenceSet && !state.contentPreferences[notif.type]) {
            console.log(`[NotificationManager] Filtered out ${notif.title} - type mismatch (${notif.type})`);
            return false;
          }
          
          if (notif.tags && notif.tags.length > 0) {
            const userSelectedGenres = Object.keys(state.selectedGenres)
              .filter(k => state.selectedGenres[k])
              .map(g => g.toLowerCase());
            
            const customTags = state.customTags.map(t => t.toLowerCase());
            const allUserInterests = [...userSelectedGenres, ...customTags];

            if (allUserInterests.length > 0) {
              const hasMatch = notif.tags.some(tag => 
                allUserInterests.includes(tag.toLowerCase())
              );
              if (!hasMatch) {
                console.log(`[NotificationManager] Filtered out ${notif.title} - no matching tags.`);
                return false;
              }
            }
          }
          return true;
        });

        const existingIds = new Set(state.notificationItems.map((n) => n.id));
        const newNotifications = filtered.filter(n => !existingIds.has(n.id));

        if (newNotifications.length > 0) {
          console.log(`[NotificationManager] SUCCESS: Found ${newNotifications.length} NEW notifications!`, newNotifications);
          
          // Process oldest to newest
          [...newNotifications].reverse().forEach((notif) => {
            state.addNotification({
              id: notif.id,
              title: notif.title,
              message: notif.message,
              type: notif.type,
              url: notif.url,
              timestamp: notif.createdAt
            });

            // Trigger Browser Popup
            if (typeof window !== "undefined" && Notification.permission === "granted") {
              try {
                new Notification(notif.title, {
                  body: notif.message || "New content available!",
                  icon: "/icon.png"
                });
              } catch (e) {
                console.error("[NotificationManager] Browser notification error:", e);
              }
            }
          });

          // Play Sound
          try {
            const audio = new Audio("/notify.wav");
            audio.play().catch(e => console.warn("[NotificationManager] Audio blocked by browser policy:", e));
          } catch (e) {
            console.error("[NotificationManager] Audio setup error:", e);
          }
        } else {
          console.log("[NotificationManager] Checked. No new relevant notifications found.");
        }
      } catch (err) {
        console.error("[NotificationManager] Error in check cycle:", err);
      }
    };

    // Run immediately
    checkNotifications();

    // Poll every 30 seconds
    const intervalId = setInterval(checkNotifications, 30000);
    
    return () => {
      console.log("[NotificationManager] Cleaning up interval...");
      clearInterval(intervalId);
    };
  }, [
    isMounted,
    store._hasHydrated, 
    store.notifications.enabled,
    store.contentPreferences,
    store.selectedGenres,
    store.customTags
  ]);

  return null;
}
