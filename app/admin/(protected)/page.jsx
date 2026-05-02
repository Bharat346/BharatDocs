"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  User,
  LogOut,
  Activity,
  FileStack,
  Database,
  Settings,
  Upload,
  FileEdit,
  ArrowRight,
  Key,
  Newspaper,
} from "lucide-react";
import Link from "next/link";
import { useThemeContext } from "@/components/ThemeProvider";

export default function AdminProfilePage() {
  const [username, setUsername] = useState("Admin");
  const { mounted } = useThemeContext();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const user = Cookies.get("admin_user");
    if (user) {
      setUsername(user);
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API endpoint
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    }
    Cookies.remove("admin_session");
    Cookies.remove("admin_user");
    // Use window.location for immediate redirect with Link prefetch via onClick
    setShowLogoutConfirm(false);
    // Navigate using Link component
    window.location.href = "/admin/login";
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-8 bg-transparent">
      {/* Header / Profile */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 md:p-10 shadow-sm transition-colors">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center p-0.5 shadow-xl shadow-blue-500/20">
            <div className="w-full h-full rounded-[20px] bg-white dark:bg-black flex items-center justify-center transition-colors">
              <User className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black text-neutral-800 dark:text-neutral-100 uppercase tracking-tighter">
              {username}
            </h1>
            <p className="text-sm text-neutral-500 mt-2 flex items-center gap-2 font-black uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Administrator Access
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-500 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all font-semibold"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          href="/admin/uploader"
          icon={<Upload className="w-8 h-8 text-blue-500" />}
          title="PDF Uploader"
          desc="Upload lecture notes to Vercel Blob"
        />
        <DashboardCard
          href="/admin/editor"
          icon={<FileEdit className="w-8 h-8 text-indigo-500" />}
          title="MDX Editor"
          desc="Author and push content to GitHub"
        />
        <DashboardCard
          href="/admin/blogs"
          icon={<Newspaper className="w-8 h-8 text-rose-500" />}
          title="Blog Manager"
          desc="Create and manage blog posts"
        />
        <DashboardCard
          href="/admin/docs"
          icon={<FileStack className="w-8 h-8 text-purple-500" />}
          title="Content Manager"
          desc="Manage nodes and collections"
        />
        <DashboardCard
          href="/admin/logs"
          icon={<Database className="w-8 h-8 text-emerald-500" />}
          title="Audit Logs"
          desc="Review administrative actions"
        />
        <DashboardCard
          href="/admin/settings"
          icon={<Settings className="w-8 h-8 text-orange-500" />}
          title="Settings"
          desc="Configure system preferences"
        />
        <DashboardCard
          href="/admin/hash"
          icon={<Key className="w-8 h-8 text-blue-400" />}
          title="Generate Hash"
          desc="Create secure PBKDF2 hashes"
        />
        <DashboardCard
          href="/admin/health"
          icon={<Activity className="w-8 h-8 text-emerald-500" />}
          title="System Health"
          desc="Monitor API & Database status"
        />
      </div>
    </div>
  );
}

function DashboardCard({ href, icon, title, desc }) {
  return (
    <Link
      href={href}
      className="group p-6 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-blue-500/50 hover:bg-white dark:hover:bg-neutral-900 transition-all shadow-sm dark:shadow-none"
    >
      <div className="mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-neutral-500 leading-relaxed font-medium">
        {desc}
      </p>
      <div className="mt-6 flex items-center text-xs font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Manage <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </Link>
  );
}
