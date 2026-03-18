"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Shield,
  Globe,
  Server,
  RefreshCw,
  AlertTriangle,
  Database,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SimpleLogsPage() {
  const [logs, setLogs] = useState({ accessLogs: [], securityEvents: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("access");
  const [timeRange, setTimeRange] = useState("7d");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/logs?timeRange=${timeRange}&limit=50`,
      );
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [timeRange]);

  const activeLogs =
    activeTab === "access" ? logs.accessLogs : logs.securityEvents;

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-3xl shadow-sm">
        <div className="flex items-center gap-5">
          <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-neutral-800 dark:text-neutral-100">
              Audit & Access Logs
            </h1>
            <p className="text-sm text-neutral-500 font-medium">
              Real-time system monitoring and event tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-black p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-inner">
          {["1d", "7d", "30d"].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                timeRange === r
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              }`}
            >
              {r}
            </button>
          ))}
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 ml-4 text-emerald-600 hover:rotate-180 transition-transform duration-500"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatsSummary
          label="Access Logs"
          val={logs.accessLogs?.length || 0}
          icon={<Globe className="w-4 h-4 text-blue-500" />}
          color="blue"
        />
        <StatsSummary
          label="Security Risks"
          val={logs.securityEvents?.length || 0}
          icon={<Shield className="w-4 h-4 text-red-500" />}
          color="red"
        />
        <StatsSummary
          label="Status"
          val="Live"
          icon={<Activity className="w-4 h-4 text-emerald-500" />}
          color="emerald"
        />
        <StatsSummary
          label="Database"
          val="Connected"
          icon={<Server className="w-4 h-4 text-indigo-500" />}
          color="indigo"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("access")}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all border ${
            activeTab === "access"
              ? "bg-neutral-800 dark:bg-white text-white dark:text-black border-transparent shadow-xl"
              : "bg-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 border-neutral-200 dark:border-neutral-800"
          }`}
        >
          <Globe className="w-4 h-4" />
          Access
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all border ${
            activeTab === "security"
              ? "bg-neutral-800 dark:bg-white text-white dark:text-black border-transparent shadow-xl"
              : "bg-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 border-neutral-200 dark:border-neutral-800"
          }`}
        >
          <Shield className="w-4 h-4" />
          Security
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Timestamp
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  IP ADDRESS
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Path / Resource
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Method
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Status / Event
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
              <AnimatePresence mode="wait">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
                        <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
                          Streaming logs...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : activeLogs?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-neutral-300 dark:text-neutral-700">
                        <AlertTriangle className="w-12 h-12" />
                        <span className="text-xs font-black uppercase tracking-widest">
                          No logs found for this period
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  activeLogs.map((log, i) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="group hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-neutral-800 dark:text-neutral-200">
                            {new Date(
                              log.accessedAt || log.createdAt,
                            ).toLocaleTimeString([], {
                              hour12: false,
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                          <span className="text-[9px] text-neutral-400 font-bold uppercase">
                            {new Date(
                              log.accessedAt || log.createdAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/10 px-2 py-1 rounded-md">
                          {log.ipAddress}
                        </code>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">
                        <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
                          {log.path || log.event}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase border ${
                            log.method === "POST"
                              ? "bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800/30 text-orange-600"
                              : "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800/30 text-indigo-600"
                          }`}
                        >
                          {log.method || log.severity || "UNKNOWN"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              log.statusCode >= 400 ||
                              log.severity === "critical"
                                ? "bg-red-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                            {log.statusCode ||
                              (log.severity
                                ? log.severity.toUpperCase()
                                : "OK")}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Placeholder */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100/30 dark:bg-black/20 flex justify-between items-center">
          <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">
            Showing last {activeLogs?.length || 0} entries
          </span>
          <div className="flex gap-2">
            <button
              className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30"
              disabled
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30"
              disabled
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsSummary({ label, val, icon, color }) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
        {icon}
      </div>
      <div className="flex flex-col gap-1 relative z-10">
        <span className="text-[10px] uppercase font-black tracking-widest text-neutral-400 mb-1 flex items-center gap-2">
          {icon} {label}
        </span>
        <span
          className={`text-2xl font-black text-${color}-600 dark:text-${color}-500 transition-all`}
        >
          {val}
        </span>
      </div>
    </div>
  );
}
