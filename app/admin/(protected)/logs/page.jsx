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
  Search,
  X,
  Copy,
} from "lucide-react";
import BharatLoader from "@/components/ui/loader";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function SimpleLogsPage() {
  const [logs, setLogs] = useState({ 
    accessLogs: [], 
    securityEvents: [], 
    hourlyStats: [],
    stats: {}
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("access");
  const [timeRange, setTimeRange] = useState("7d");
  
  // Pagination & Search State
  const [page, setPage] = useState(1);
  const [searchPath, setSearchPath] = useState("");
  const [searchIp, setSearchIp] = useState("");
  const [pagination, setPagination] = useState({
    totalPagesAccess: 1,
    totalPagesSecurity: 1,
    totalAccess: 0,
    totalSecurity: 0
  });

  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        timeRange,
        limit: "50",
        page: page.toString(),
        path: searchPath,
        ip: searchIp,
      });
      
      const res = await fetch(`/api/admin/logs?${query.toString()}`);
      const data = await res.json();
      console.log("LOGS DATA:", data.data); // DEBUG
      if (data.success) {
        setLogs(data.data);
        setPagination(data.data.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    setSelectedLogs([]); // Reset selection when filters change
  }, [timeRange, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleDeleteLogs = async () => {
    if (selectedLogs.length === 0) return;

    try {
      const res = await fetch("/api/admin/logs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          ids: selectedLogs,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedLogs([]);
        setShowDeleteConfirm(false);
        fetchLogs(); // Refresh the data
      } else {
        alert("Failed to delete logs: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete logs");
    }
  };

  const toggleLogSelection = (logId) => {
    setSelectedLogs(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  const selectAllLogs = () => {
    if (selectedLogs.length === activeLogs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(activeLogs.map(log => log.id));
    }
  };

  const activeLogs =
    activeTab === "access" ? logs.accessLogs : logs.securityEvents;
  
  const totalPages = activeTab === "access" 
    ? pagination.totalPagesAccess 
    : pagination.totalPagesSecurity;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 text-neutral-800 dark:text-neutral-100">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-3xl shadow-sm">
        <div className="flex items-center gap-5">
          <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest">
              Audit & Access Logs
            </h1>
            <p className="text-sm text-neutral-500 font-medium">
              Real-time system monitoring and event tracking
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-neutral-100 dark:bg-black p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-inner">
          {["1d", "7d", "30d", "all"].map((r) => (
            <button
              key={r}
              onClick={() => {
                setTimeRange(r);
                setPage(1);
              }}
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
            onClick={() => {
              setPage(1);
              fetchLogs();
            }}
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
          val={pagination.totalAccess || 0}
          icon={<Globe className="w-4 h-4 text-blue-500" />}
          color="blue"
        />
        <StatsSummary
          label="Security Risks"
          val={pagination.totalSecurity || 0}
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

      {/* Security Visualization */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {logs.hourlyStats?.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] shadow-sm"
            >
              <div className="mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  Time Distribution (24h)
                </h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={logs.hourlyStats}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#88888815" />
                    <XAxis 
                      dataKey="hour" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#888', fontWeight: 600 }} 
                      tickFormatter={(val) => `${val}:00`}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888', fontWeight: 600 }} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '16px', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '10px', color: '#fff', fontWeight: 800, textTransform: 'uppercase' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {logs.hourlyStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.count > 10 ? '#ef4444' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {logs.eventTypes?.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] shadow-sm"
            >
              <div className="mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                  <Shield className="w-5 h-5 text-indigo-500" />
                  Classifier: Event Types
                </h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={logs.eventTypes} layout="vertical">
                    <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#88888815" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="type" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      width={100}
                      tick={{ fontSize: 9, fill: '#888', fontWeight: 900, textTransform: 'uppercase' }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '16px', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '10px', color: '#fff', fontWeight: 800, textTransform: 'uppercase' }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                      {logs.eventTypes.map((entry, index) => (
                        <Cell key={`cell-et-${index}`} fill={['#6366f1', '#f59e0b', '#ef4444', '#10b981'][index % 4]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Controls & Tabs */}
      <div className="flex flex-col md:flex-row gap-6 mb-6 justify-between items-end">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setActiveTab("access");
              setPage(1);
              setSelectedLogs([]);
            }}
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
            onClick={() => {
              setActiveTab("security");
              setPage(1);
              setSelectedLogs([]);
            }}
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

        {selectedLogs.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Delete {selectedLogs.length} Log{selectedLogs.length > 1 ? 's' : ''}
            </button>
            <button
              onClick={() => setSelectedLogs([])}
              className="px-6 py-3 bg-neutral-600 text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-neutral-500 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        )}

        {activeTab === "access" && (
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input 
                type="text" 
                placeholder="SEARCH PATH..." 
                value={searchPath}
                onChange={(e) => setSearchPath(e.target.value)}
                className="pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 ring-emerald-500/50 w-48 transition-all"
              />
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input 
                type="text" 
                placeholder="SEARCH IP..." 
                value={searchIp}
                onChange={(e) => setSearchIp(e.target.value)}
                className="pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 ring-emerald-500/50 w-40 transition-all"
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
            >
              Filter
            </button>
          </form>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  <input
                    type="checkbox"
                    checked={selectedLogs.length === activeLogs.length && activeLogs.length > 0}
                    onChange={selectAllLogs}
                    className="w-4 h-4 text-emerald-600 bg-neutral-100 border-neutral-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600"
                  />
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Timestamp
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  IP ADDRESS
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  {activeTab === "access" ? "Path / Resource" : "Event Type"}
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  {activeTab === "access" ? "Method" : "Details"}
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Status / Severity
                </th>
                {activeTab === "access" && (
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Location
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.tr
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={activeTab === "access" ? "7" : "6"} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <BharatLoader text="Fetching Logs..." />
                        <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
                          Streaming logs...
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ) : activeLogs?.length === 0 ? (
                  <motion.tr
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td colSpan={activeTab === "access" ? "7" : "6"} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-neutral-300 dark:text-neutral-700">
                        <AlertTriangle className="w-12 h-12" />
                        <span className="text-xs font-black uppercase tracking-widest">
                          No {activeTab} logs found
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  activeLogs.map((log, i) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.01 }}
                      className="group hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 border-l-4 border-transparent group-hover:border-emerald-500 transition-all">
                        <input
                          type="checkbox"
                          checked={selectedLogs.includes(log.id)}
                          onChange={() => toggleLogSelection(log.id)}
                          className="w-4 h-4 text-emerald-600 bg-neutral-100 border-neutral-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black">
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
                        {activeTab === "access" ? (
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase border ${
                              log.method === "POST"
                                ? "bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800/30 text-orange-600"
                                : "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800/30 text-indigo-600"
                            }`}
                          >
                            {log.method || "GET"}
                          </span>
                        ) : (
                          <HoverDetailsButton log={log} onClick={() => setSelectedLog(log)} />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              (log.statusCode && log.statusCode >= 400) ||
                              log.severity === "critical"
                                ? "bg-red-500"
                                : log.severity === "warn"
                                ? "bg-orange-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          <span className={`text-[10px] font-black uppercase ${
                            log.severity === "critical" ? "text-red-500" : 
                            log.severity === "warn" ? "text-orange-500" : 
                            ""
                          }`}>
                            {log.statusCode ||
                              (log.severity
                                ? log.severity.toUpperCase()
                                : "OK")}
                          </span>
                        </div>
                      </td>
                      {activeTab === "access" && (
                        <td className="px-6 py-4">
                          <div className="text-[10px] text-neutral-500">
                            {log.country && (
                              <div className="font-medium">
                                {log.country}{log.countryCode && ` (${log.countryCode})`}
                              </div>
                            )}
                            {log.city && log.region && (
                              <div className="text-[9px] text-neutral-400">
                                {log.city}, {log.region}
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100/30 dark:bg-black/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">
            Page {page} of {totalPages || 1} • {activeTab === "access" ? pagination.totalAccess : pagination.totalSecurity} total entries
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 flex items-center gap-2 px-4 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase">Prev</span>
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 flex items-center gap-2 px-4 shadow-sm"
            >
              <span className="text-[10px] font-black uppercase">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Details Modal */}
        <AnimatePresence>
          {selectedLog && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden"
              >
                <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
                      <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-widest">
                        Log Entry Details
                      </h3>
                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                        {selectedLog.event || selectedLog.path} • {selectedLog.ipAddress}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedLog(null)}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                </div>

                <div className="p-8">
                  <div className="bg-neutral-50 dark:bg-black/40 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 relative group">
                    <button 
                      onClick={() => {
                        const content = typeof selectedLog.details === 'object' 
                          ? JSON.stringify(selectedLog.details, null, 2) 
                          : (selectedLog.details || "No details");
                        navigator.clipboard.writeText(content);
                      }}
                      className="absolute right-4 top-4 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Copy</span>
                    </button>
                    <pre className="text-xs font-mono text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap break-all leading-relaxed overflow-auto max-h-60 scrollbar-hide">
                      {typeof selectedLog.details === 'object' 
                        ? JSON.stringify(selectedLog.details, null, 2) 
                        : (selectedLog.details || "No technical details recorded for this entry.")}
                    </pre>
                  </div>
                </div>

                <div className="p-8 bg-neutral-50 dark:bg-black/20 text-center">
                  <button 
                    onClick={() => setSelectedLog(null)}
                    className="w-full py-4 bg-neutral-800 dark:bg-white text-white dark:text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden"
              >
                <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-widest">
                        Confirm Deletion
                      </h3>
                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                        Delete {selectedLogs.length} {activeTab} log{selectedLogs.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                </div>

                <div className="p-8">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                    Are you sure you want to permanently delete {selectedLogs.length} selected log{selectedLogs.length > 1 ? 's' : ''}? This action cannot be undone.
                  </p>
                </div>

                <div className="p-8 bg-neutral-50 dark:bg-black/20 flex gap-4">
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-4 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteLogs}
                    className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-red-600/20"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function HoverDetailsButton({ log, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center gap-2 group/btn"
      >
        <span className="text-[10px] text-neutral-500 truncate max-w-[200px] block group-hover/btn:text-emerald-500 transition-colors underline decoration-dotted decoration-neutral-300">
          {log.details || "View Details"}
        </span>
      </button>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute z-50 top-full left-0 mt-2 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-sm font-black uppercase tracking-widest text-neutral-800 dark:text-neutral-100">
                Event Details
              </h4>
              <button 
                onClick={() => {
                  const content = typeof log.details === 'object' 
                    ? JSON.stringify(log.details, null, 2) 
                    : (log.details || "No details");
                  navigator.clipboard.writeText(content);
                }}
                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-600/20 transition-colors"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <pre className="text-xs font-mono text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap break-all leading-relaxed max-h-40 overflow-auto scrollbar-hide">
              {typeof log.details === 'object' 
                ? JSON.stringify(log.details, null, 2) 
                : (log.details || "No technical details recorded for this entry.")}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatsSummary({ label, val, icon, color }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
      <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className={`p-8 bg-${color}-500/10 rounded-full`}>
           {icon}
        </div>
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
