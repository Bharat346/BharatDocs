// app/(public)/docs/components/StatsPanel.jsx
import { Sparkles, BookOpen, Folder, File, Clock } from "lucide-react";

export default function StatsPanel({ theme, stats }) {
  return (
    <div
      className="
        col-span-full
        space-y-4
        lg:col-span-1
        lg:space-y-6
      "
    >
      {/* Header */}
      <div
        className={`rounded-2xl p-4 sm:p-6 ${
          theme === "dark"
            ? "bg-zinc-900/70 border border-zinc-800"
            : "bg-white/70 border border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              theme === "dark" ? "bg-blue-500/20" : "bg-blue-100"
            }`}
          >
            <Sparkles
              className={`h-5 w-5 sm:h-6 sm:w-6 ${
                theme === "dark" ? "text-blue-400" : "text-blue-500"
              }`}
            />
          </div>
          <div>
            <h1
              className={`text-[clamp(1.125rem,4vw,1.25rem)] font-bold ${
                theme === "dark" ? "text-zinc-100" : "text-gray-900"
              }`}
            >
              Docs Library
            </h1>
            <p
              className={`text-xs sm:text-sm ${
                theme === "dark" ? "text-zinc-400" : "text-gray-600"
              }`}
            >
              {stats.totalDocs} resources
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="hidden lg:block">
        <QuickStats theme={theme} stats={stats} />
      </div>
    </div>
  );
}

function QuickStats({ theme, stats }) {
  return (
    <div
      className={`rounded-2xl p-4 sm:p-6 ${
        theme === "dark"
          ? "bg-zinc-900/70 border border-zinc-800"
          : "bg-white/70 border border-gray-200"
      }`}
    >
      <h2
        className={`text-[clamp(1rem,3vw,1.125rem)] font-semibold mb-4 ${
          theme === "dark" ? "text-zinc-100" : "text-gray-900"
        }`}
      >
        Quick Stats
      </h2>

      {/* Grid for better mobile spacing */}
      <div className="grid grid-cols-1 gap-3">
        <StatItem
          theme={theme}
          icon={BookOpen}
          label="Total Documents"
          value={stats.totalDocs}
          color="blue"
        />
        <StatItem
          theme={theme}
          icon={Folder}
          label="Collections"
          value={stats.totalCollections}
          color="emerald"
        />
        <StatItem
          theme={theme}
          icon={File}
          label="PDF Files"
          value={stats.pdfCount}
          color="red"
        />
        <StatItem
          theme={theme}
          icon={Clock}
          label="Updated (7d)"
          value={stats.recentDocs}
          color="amber"
        />
      </div>
    </div>
  );
}

function StatItem({ theme, icon: Icon, label, value, color }) {
  const colors = {
    blue: { dark: "text-blue-400", light: "text-blue-500" },
    emerald: { dark: "text-emerald-400", light: "text-emerald-500" },
    red: { dark: "text-red-400", light: "text-red-500" },
    amber: { dark: "text-amber-400", light: "text-amber-500" },
  };

  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2">
      <div className="flex items-center gap-2">
        <Icon
          className={`h-4 w-4 ${
            theme === "dark" ? colors[color].dark : colors[color].light
          }`}
        />
        <span
          className={`text-sm ${
            theme === "dark" ? "text-zinc-300" : "text-gray-700"
          }`}
        >
          {label}
        </span>
      </div>

      <span
        className={`text-sm sm:text-base font-bold ${
          theme === "dark" ? colors[color].dark : colors[color].light
        }`}
      >
        {value}
      </span>
    </div>
  );
}
