"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ShieldCheck,
  Database,
  Github,
  Cloud,
  AlertCircle,
  RefreshCw,
  Clock,
  Cpu,
  Server,
  Key,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeContext } from "@/components/ThemeProvider";

export default function SystemHealthPage() {
  const { mounted } = useThemeContext();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/health");
      const data = await res.json();
      setHealthData(data);
      setLastCheck(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60000); // Auto refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-[2.5rem] shadow-sm transition-colors">
        <div className="flex items-center gap-6">
          <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-500/20">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-neutral-800 dark:text-neutral-100 uppercase tracking-tighter">
              System Health Status
            </h1>
            <div className="flex items-center gap-3 mt-2 text-xs font-black uppercase tracking-widest text-neutral-500">
              <div
                className={`w-2 h-2 rounded-full ${healthData?.status === "healthy" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
              />
              Status:{" "}
              {healthData?.status === "healthy"
                ? "System Operational"
                : "Action Required"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">
              Last Check
            </div>
            <div className="text-xs font-mono font-medium text-neutral-600 dark:text-neutral-400">
              {lastCheck?.toLocaleTimeString() || "..."}
            </div>
          </div>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="p-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-2xl transition-all group active:scale-95"
          >
            <RefreshCw
              className={`w-5 h-5 text-neutral-500 group-hover:text-blue-500 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Core Services */}
        <div className="md:col-span-2 space-y-8">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2 px-1">
            <Server className="w-4 h-4" /> Core Services Monitoring
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <HealthCard
              title="Database Node"
              status={healthData?.checks?.database?.status}
              icon={<Database className="w-5 h-5" />}
              message={healthData?.checks?.database?.message}
              details="Neon-Postgres Connectivity"
            />
            <HealthCard
              title="GitHub Integration"
              status={healthData?.checks?.github?.status}
              icon={<Github className="w-5 h-5" />}
              message={healthData?.checks?.github?.message}
              details="Repo: docs-storage API"
            />
            <HealthCard
              title="Vercel Blob Storage"
              status={healthData?.checks?.vercelBlob?.status}
              icon={<Cloud className="w-5 h-5" />}
              message={healthData?.checks?.vercelBlob?.message}
              details="File Upload Capability"
            />
            <HealthCard
              title="Server Instance"
              status="up"
              icon={<Cpu className="w-5 h-5" />}
              details={`${Math.floor(healthData?.uptime / 3600 || 0)}h ${Math.floor((healthData?.uptime % 3600) / 60 || 0)}m Uptime`}
            />
          </div>
        </div>

        {/* Environment Security Check */}
        <div className="space-y-8">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2 px-1">
            <Key className="w-4 h-4" /> Environment Config
          </h3>

          <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-6 space-y-4 shadow-sm">
            <EnvCheck
              label="DATABASE_URL"
              present={healthData?.checks?.env?.DATABASE_URL}
            />
            <EnvCheck
              label="BLOB_TOKEN"
              present={healthData?.checks?.env?.vercel_rw_token_READ_WRITE_TOKEN}
            />
            <EnvCheck
              label="GITHUB_AT"
              present={healthData?.checks?.env?.github_AT}
            />
            <EnvCheck
              label="SESSION_SECRET"
              present={healthData?.checks?.env?.SESSION_SECRET}
            />
            <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800">
              <p className="text-[10px] text-neutral-400 italic">
                Values are not shown for security. This check only verifies
                existence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timestamp info */}
      <div className="bg-neutral-100 dark:bg-neutral-900/30 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 border border-neutral-200/50 dark:border-neutral-800/50">
        <div className="flex items-center gap-4">
          <Clock className="w-5 h-5 text-neutral-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest leading-none mb-1">
              Current Server Timestamp
            </span>
            <code className="text-xs font-mono font-medium opacity-70">
              {healthData?.timestamp || "..."}
            </code>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500">
          <ShieldCheck className="w-5 h-5" />
          Verified Admin Session
        </div>
      </div>
    </div>
  );
}

function HealthCard({ title, status, icon, message, details }) {
  const isUp = status === "up";
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-2xl transition-colors ${isUp ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-red-50 dark:bg-red-900/20 text-red-600"}`}
        >
          {icon}
        </div>
        <div className={`mt-2 ${isUp ? "text-emerald-500" : "text-red-500"}`}>
          {isUp ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
        </div>
      </div>
      <h4 className="text-md font-black text-neutral-800 dark:text-neutral-100 uppercase tracking-tighter leading-tight">
        {title}
      </h4>
      <p className="text-[11px] text-neutral-500 font-medium mt-1 uppercase tracking-wider">
        {details}
      </p>
      {message && (
        <div className="mt-4 p-3 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">
          <p className="text-[10px] text-red-600 font-bold leading-tight flex items-start gap-2">
            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" /> {message}
          </p>
        </div>
      )}
    </div>
  );
}

function EnvCheck({ label, present }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-black/20 border border-neutral-100 dark:border-neutral-800/50 transition-colors">
      <span className="text-[11px] font-black text-neutral-600 dark:text-neutral-400 tracking-tighter">
        {label}
      </span>
      {present ? (
        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-lg border border-emerald-200 dark:border-emerald-800">
          Present
        </span>
      ) : (
        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg border border-red-200 dark:border-red-800">
          Missing
        </span>
      )}
    </div>
  );
}
