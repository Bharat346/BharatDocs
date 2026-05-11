import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/*
 * User Profile Store
 * ------------------
 * Stores user preferences, content interests, genre selections,
 * notification settings, and recent activity — all in localStorage.
 */

// Available content categories and their genres
export const CONTENT_CATEGORIES = {
  notes: {
    label: 'Notes',
    icon: 'BookOpen',
    genres: [
      { id: 'btech', label: 'BTech Notes', icon: '🎓' },
      { id: 'jee', label: 'JEE', icon: '🧪' },
      { id: 'gate', label: 'GATE', icon: '💻' },
      { id: 'ssc', label: 'SSC', icon: '📝' },
      { id: 'upsc', label: 'UPSC', icon: '🏛️' },
      { id: 'neet', label: 'NEET', icon: '🩺' },
    ],
  },
  docs: {
    label: 'Documents',
    icon: 'FileText',
    genres: [
      { id: 'tech', label: 'Tech', icon: '💡' },
      { id: 'programming', label: 'Programming', icon: '⚡' },
      { id: 'web-dev', label: 'Web Dev', icon: '🌐' },
      { id: 'ml', label: 'ML', icon: '🤖' },
      { id: 'dl', label: 'DL', icon: '🧠' },
      { id: 'embedded-system', label: 'Embedded System', icon: '📟' },
      { id: 'system-design', label: 'System Design', icon: '🏗️' },
      { id: 'database', label: 'Database', icon: '🗄️' },
    ],
  },
  blogs: {
    label: 'Blogs',
    icon: 'Newspaper',
    genres: [
      { id: 'tech', label: 'Tech', icon: '💡' },
      { id: 'web-dev', label: 'Web Dev', icon: '🌐' },
      { id: 'ml', label: 'ML', icon: '🤖' },
      { id: 'dl', label: 'DL', icon: '🧠' },
      { id: 'embedded-system', label: 'Embedded System', icon: '📟' },
      { id: 'system-design', label: 'System Design', icon: '🏗️' },
      { id: 'tutorial', label: 'Tutorials', icon: '📖' },
      { id: 'career', label: 'Career', icon: '🚀' },
      { id: 'project', label: 'Projects', icon: '🛠️' },
    ],
  },
};

export const useUserProfileStore = create(
  persist(
    (set, get) => ({
      // Profile basics
      displayName: '',
      avatarEmoji: '🧑‍💻',
      isProfileSetup: false,

      // Content preferences: { notes: true, docs: false, blogs: true }
      contentPreferences: {
        notes: true,
        docs: true,
        blogs: true,
      },

      // Hydration flag
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),

      // Genre selections: { btech: true, jee: false, ... }
      selectedGenres: {
        'btech': true,
        'programming': true,
        'tech': true
      },

      // Custom tags typed by the user
      customTags: [],

      // Notification settings
      notifications: {
        enabled: true,
        pushEnabled: false,
        frequency: 'daily', // 'realtime' | 'daily' | 'weekly'
      },

      // Recent activity log (max 50 items)
      recentActivity: [],

      // Weekly activity data for charts (last 7 days)
      weeklyActivity: [
        { day: 'Mon', views: 0, reads: 0 },
        { day: 'Tue', views: 0, reads: 0 },
        { day: 'Wed', views: 0, reads: 0 },
        { day: 'Thu', views: 0, reads: 0 },
        { day: 'Fri', views: 0, reads: 0 },
        { day: 'Sat', views: 0, reads: 0 },
        { day: 'Sun', views: 0, reads: 0 },
      ],

      // Unread notification count
      unreadCount: 0,

      // Notification items
      notificationItems: [],

      // --- Actions ---
      setDisplayName: (name) => set({ displayName: name }),
      setAvatarEmoji: (emoji) => set({ avatarEmoji: emoji }),
      setProfileSetup: (val) => set({ isProfileSetup: val }),

      toggleContentPreference: (category) =>
        set((state) => ({
          contentPreferences: {
            ...state.contentPreferences,
            [category]: !state.contentPreferences[category],
          },
        })),

      toggleGenre: (genreId) =>
        set((state) => ({
          selectedGenres: {
            ...state.selectedGenres,
            [genreId]: !state.selectedGenres[genreId],
          },
        })),

      addCustomTag: (tag) =>
        set((state) => {
          const lowerTag = tag.toLowerCase().trim();
          if (!lowerTag || state.customTags.includes(lowerTag)) return state;
          return { customTags: [...state.customTags, lowerTag] };
        }),

      removeCustomTag: (tag) =>
        set((state) => ({
          customTags: state.customTags.filter((t) => t !== tag),
        })),

      setNotificationSetting: (key, value) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: value,
          },
        })),

      addActivity: (activity) =>
        set((state) => {
          // Identify unique activity by URL or title
          const activityId = activity.url || activity.title;
          const existingIndex = state.recentActivity.findIndex(
            (a) => (a.url || a.title) === activityId
          );

          let updated;
          if (existingIndex !== -1) {
            // Update existing activity: increment count and move to top
            const existing = state.recentActivity[existingIndex];
            const updatedActivity = {
              ...existing,
              timestamp: new Date().toISOString(),
              count: (existing.count || 1) + 1,
            };
            updated = [
              updatedActivity,
              ...state.recentActivity.filter((_, i) => i !== existingIndex),
            ];
          } else {
            // New activity
            const newActivity = {
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              count: 1,
              ...activity,
            };
            updated = [newActivity, ...state.recentActivity];
          }

          updated = updated.slice(0, 50);

          // Update weekly activity stats
          const dayIndex = new Date().getDay();
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const todayName = dayNames[dayIndex];
          const updatedWeekly = state.weeklyActivity.map((d) =>
            d.day === todayName
              ? {
                  ...d,
                  views: d.views + (activity.type === 'view' ? 1 : 0),
                  reads: d.reads + (activity.type === 'read' ? 1 : 0),
                }
              : d,
          );

          return {
            recentActivity: updated.slice(0, 10), // Max 10 items
            weeklyActivity: updatedWeekly,
          };
        }),

      addNotification: (notification) =>
        set((state) => ({
          notificationItems: [
            {
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              read: false,
              ...notification,
            },
            ...state.notificationItems,
          ].slice(0, 30),
          unreadCount: state.unreadCount + 1,
        })),

      markAllRead: () =>
        set((state) => ({
          unreadCount: 0,
          notificationItems: state.notificationItems.map((n) => ({
            ...n,
            read: true,
          })),
        })),

      clearActivity: () => set({ recentActivity: [] }),

      resetProfile: () =>
        set({
          displayName: '',
          avatarEmoji: '🧑‍💻',
          isProfileSetup: false,
          contentPreferences: { notes: true, docs: true, blogs: true },
          selectedGenres: {},
          customTags: [],
          notifications: {
            enabled: true,
            pushEnabled: false,
            frequency: 'daily',
          },
          recentActivity: [],
          weeklyActivity: [
            { day: 'Mon', views: 0, reads: 0 },
            { day: 'Tue', views: 0, reads: 0 },
            { day: 'Wed', views: 0, reads: 0 },
            { day: 'Thu', views: 0, reads: 0 },
            { day: 'Fri', views: 0, reads: 0 },
            { day: 'Sat', views: 0, reads: 0 },
            { day: 'Sun', views: 0, reads: 0 },
          ],
          unreadCount: 0,
          notificationItems: [],
        }),
    }),
    {
      name: 'user-profile-storage',
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      }
    },
  ),
);
