"use client";

import { useState, useEffect } from "react";
import {
  useUserProfileStore,
  CONTENT_CATEGORIES,
} from "@/hooks/useUserProfile";
import { useThemeContext } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Bell,
  BellRing,
  Settings,
  BookOpen,
  FileText,
  Newspaper,
  Check,
  ChevronRight,
  Clock,
  Eye,
  BookMarked,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  Plus,
  Hash,
  X,
} from "lucide-react";
import Link from "next/link";

const AVATAR_OPTIONS = [
  "🧑‍💻",
  "👨‍🎓",
  "👩‍🎓",
  "🧑‍🔬",
  "👩‍💻",
  "🦊",
  "🐱",
  "🎯",
  "🚀",
  "⚡",
  "🌟",
  "🎨",
];

const CATEGORY_ICONS = {
  notes: BookOpen,
  docs: FileText,
  blogs: Newspaper,
};

export default function UserProfilePage() {
  const { theme } = useThemeContext();
  const store = useUserProfileStore();
  const [activeTab, setActiveTab] = useState("preferences");
  const [nameInput, setNameInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [mounted, setMounted] = useState(false);

  // Sync name input when store hydrates
  useEffect(() => {
    if (store._hasHydrated) {
      setNameInput(store.displayName || "");
    }
  }, [store._hasHydrated, store.displayName]);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted || !store._hasHydrated) return null;

  const tabs = [
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "activity", label: "Activity", icon: TrendingUp },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const handleSaveName = () => {
    store.setDisplayName(nameInput.trim());
    if (nameInput.trim()) store.setProfileSetup(true);
  };

  const totalGenresSelected =
    Object.values(store.selectedGenres).filter(Boolean).length +
    store.customTags.length;

  return (
    <div className="min-h-screen bg-background pt-24 px-4 sm:px-6 transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        {/* ── Back link ── */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground/30 hover:text-primary mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>

        {/* ── Profile Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-start gap-5 sm:gap-6">
            {/* Avatar Selector */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-secondary-bg border-2 border-border flex items-center justify-center text-4xl sm:text-5xl transition-colors duration-300 group-hover:border-primary/40">
                {store.avatarEmoji}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground truncate">
                  {store.displayName || "Set up your profile"}
                </h1>
                {store.isProfileSetup && (
                  <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground/40 font-medium">
                {totalGenresSelected > 0
                  ? `${totalGenresSelected} genres selected · Personalized feed active`
                  : "Configure your preferences to get personalized content"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Tab Navigation ── */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl bg-secondary-bg border border-border/50 sticky top-16 z-40 backdrop-blur-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-foreground text-background"
                  : "text-foreground/40 hover:text-foreground/70"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {activeTab === "preferences" && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Name + Avatar */}
              <div className="p-6 rounded-2xl border border-border bg-secondary-bg/30">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40 mb-5">
                  Your Identity
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    placeholder="Enter your name…"
                    className="flex-1 px-5 py-3.5 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-foreground/20 font-semibold text-base focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors shrink-0"
                  >
                    Save
                  </button>
                </div>

                {/* Emoji picker */}
                <div>
                  <span className="text-xs font-bold text-foreground/30 uppercase tracking-wider block mb-3">
                    Choose Avatar
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => store.setAvatarEmoji(emoji)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-200 border-2 ${
                          store.avatarEmoji === emoji
                            ? "border-primary bg-primary/10 scale-110"
                            : "border-border/50 bg-secondary-bg hover:border-primary/30 hover:scale-105"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Preferences */}
              <div className="p-6 rounded-2xl border border-border bg-secondary-bg/30">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40 mb-2">
                  Content I'm Interested In
                </h3>
                <p className="text-xs text-foreground/25 mb-6">
                  Select the content types you want to receive notifications for
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Object.entries(CONTENT_CATEGORIES).map(([key, cat]) => {
                    const Icon = CATEGORY_ICONS[key];
                    const isActive = store.contentPreferences[key];
                    return (
                      <button
                        key={key}
                        onClick={() => store.toggleContentPreference(key)}
                        className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 group ${
                          isActive
                            ? "border-primary bg-primary/[0.06]"
                            : "border-border bg-background hover:border-primary/20"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                            isActive
                              ? "bg-primary text-white"
                              : "bg-secondary-bg text-foreground/40 group-hover:text-primary"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-sm text-foreground">
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Genre Selection */}
              {Object.entries(CONTENT_CATEGORIES).map(([catKey, cat]) => {
                if (!store.contentPreferences[catKey]) return null;
                return (
                  <div
                    key={catKey}
                    className="p-6 rounded-2xl border border-border bg-secondary-bg/30"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        {(() => {
                          const I = CATEGORY_ICONS[catKey];
                          return <I className="w-4 h-4" />;
                        })()}
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/50">
                        {cat.label} — Genres
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {cat.genres.map((genre) => {
                        const isSelected = store.selectedGenres[genre.id];
                        return (
                          <button
                            key={genre.id}
                            onClick={() => store.toggleGenre(genre.id)}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                              isSelected
                                ? "border-primary bg-primary/[0.06]"
                                : "border-border/50 bg-background hover:border-primary/20"
                            }`}
                          >
                            <span className="text-xl shrink-0">
                              {genre.icon}
                            </span>
                            <div className="min-w-0">
                              <span
                                className={`text-sm font-bold block truncate ${
                                  isSelected
                                    ? "text-primary"
                                    : "text-foreground/70"
                                }`}
                              >
                                {genre.label}
                              </span>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-primary ml-auto shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Custom Tags */}
              <div className="p-6 rounded-2xl border border-border bg-secondary-bg/30">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Hash className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/50">
                    Custom Interests
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          store.addCustomTag(tagInput);
                          setTagInput("");
                        }
                      }}
                      placeholder="Type a tag (e.g. machine learning)..."
                      className="w-full pl-5 pr-12 py-3.5 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-foreground/20 font-semibold text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <button
                      onClick={() => {
                        store.addCustomTag(tagInput);
                        setTagInput("");
                      }}
                      className="absolute right-2 top-2 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {store.customTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {store.customTags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary"
                      >
                        <span className="text-xs font-bold capitalize">
                          {tag}
                        </span>
                        <button
                          onClick={() => store.removeCustomTag(tag)}
                          className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-primary/20 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-foreground/20 font-medium italic">
                    Add your own tags to follow specific topics...
                  </p>
                )}
              </div>

              {/* Notification Frequency */}
              <div className="p-6 rounded-2xl border border-border bg-secondary-bg/30">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40 mb-5">
                  Notification Frequency
                </h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    {
                      value: "realtime",
                      label: "Real-time",
                      desc: "Instant alerts",
                    },
                    {
                      value: "daily",
                      label: "Daily",
                      desc: "Once a day digest",
                    },
                    {
                      value: "weekly",
                      label: "Weekly",
                      desc: "Weekly summary",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        store.setNotificationSetting("frequency", opt.value)
                      }
                      className={`flex-1 min-w-[140px] p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                        store.notifications.frequency === opt.value
                          ? "border-primary bg-primary/[0.06]"
                          : "border-border/50 bg-background hover:border-primary/20"
                      }`}
                    >
                      <div className="font-bold text-sm text-foreground mb-0.5">
                        {opt.label}
                      </div>
                      <div className="text-[10px] text-foreground/30">
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "activity" && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Activity Chart Removed */}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    icon: Eye,
                    label: "Total Views",
                    value: store.weeklyActivity.reduce(
                      (s, d) => s + d.views,
                      0,
                    ),
                  },
                  {
                    icon: BookMarked,
                    label: "Total Reads",
                    value: store.weeklyActivity.reduce(
                      (s, d) => s + d.reads,
                      0,
                    ),
                  },
                  {
                    icon: Clock,
                    label: "Activities",
                    value: store.recentActivity.length,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-5 rounded-2xl border border-border bg-secondary-bg/30 text-center"
                  >
                    <stat.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-black text-foreground mb-0.5">
                      {stat.value}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity List */}
              <div className="p-6 rounded-2xl border border-border bg-secondary-bg/30">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40">
                    Recent Activity
                  </h3>
                  {store.recentActivity.length > 0 && (
                    <button
                      onClick={() => store.clearActivity()}
                      className="text-[10px] font-bold uppercase tracking-wider text-foreground/20 hover:text-red-500 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {store.recentActivity.length === 0 ? (
                  <div className="py-16 text-center">
                    <Clock className="w-10 h-10 mx-auto mb-3 text-foreground/10" />
                    <p className="text-sm text-foreground/25 font-medium">
                      No activity yet
                    </p>
                    <p className="text-xs text-foreground/15 mt-1">
                      Your reading and viewing history will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
                    {store.recentActivity.map((activity, i) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-background transition-colors"
                      >
                        <Link
                          href={activity.url || "#"}
                          className="flex-1 flex items-center gap-4 min-w-0"
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              activity.url?.includes("/pdf/")
                                ? "bg-red-500/10 text-red-500"
                                : activity.type === "view"
                                  ? "bg-blue-500/10 text-blue-500"
                                  : activity.type === "read"
                                    ? "bg-green-500/10 text-green-500"
                                    : "bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            {activity.url?.includes("/pdf/") ? (
                              <FileText className="w-4 h-4 text-red-500" />
                            ) : activity.type === "view" ? (
                              <Eye className="w-4 h-4" />
                            ) : activity.type === "read" ? (
                              <BookMarked className="w-4 h-4" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate flex items-center">
                              {activity.title}
                              {activity.count > 1 && (
                                <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                  {activity.count}x
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-foreground/30">
                              {new Date(activity.timestamp).toLocaleDateString(
                                "en-IN",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              activity.url?.includes("/pdf/")
                                ? "bg-red-500/10 text-red-500"
                                : activity.type === "view"
                                  ? "bg-blue-500/10 text-blue-500"
                                  : activity.type === "read"
                                    ? "bg-green-500/10 text-green-500"
                                    : "bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            {activity.url?.includes("/pdf/") ? "PDF" : activity.type}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Toggle */}
              <div className="p-6 rounded-2xl border border-border bg-secondary-bg/30">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-foreground">
                        Push Notifications
                      </div>
                      <div className="text-xs text-foreground/30">
                        Get notified about new content matching your preferences
                      </div>
                    </div>
                  </div>
                  <div 
                    onClick={() => store.setNotificationSetting("enabled", !store.notifications.enabled)}
                    className={`w-16 h-8 rounded-full transition-all duration-500 relative cursor-pointer shadow-inner ${
                      store.notifications.enabled ? "bg-primary/80" : "bg-zinc-800/40"
                    }`}
                  >
                    <motion.div 
                      animate={{ x: store.notifications.enabled ? 34 : 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-xl flex items-center justify-center"
                    >
                       <div className={`w-1.5 h-1.5 rounded-full ${store.notifications.enabled ? 'bg-primary' : 'bg-zinc-400'}`} />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Mark all read */}
              {store.unreadCount > 0 && (
                <button
                  onClick={() => store.markAllRead()}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-primary/30 text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
                >
                  Mark all as read ({store.unreadCount} unread)
                </button>
              )}

              {/* Notification list */}
              <div className="p-6 rounded-2xl border border-border bg-secondary-bg/30">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40 mb-5">
                  Recent Notifications
                </h3>

                {store.notificationItems.length === 0 ? (
                  <div className="py-16 text-center">
                    <Bell className="w-10 h-10 mx-auto mb-3 text-foreground/10" />
                    <p className="text-sm text-foreground/25 font-medium">
                      No notifications yet
                    </p>
                    <p className="text-xs text-foreground/15 mt-1">
                      Notifications about new content will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto no-scrollbar">
                    {store.notificationItems.map((notif, i) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
                          notif.read
                            ? "bg-transparent"
                            : "bg-primary/[0.03] border border-primary/10"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {notif.title}
                          </p>
                          {notif.message && (
                            <p className="text-xs text-foreground/30 mt-0.5">
                              {notif.message}
                            </p>
                          )}
                          <p className="text-[10px] text-foreground/20 mt-1">
                            {new Date(notif.timestamp).toLocaleDateString(
                              "en-IN",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
