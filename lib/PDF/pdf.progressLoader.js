import React from "react";

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export default function ProgressLoader({ progress, receivedBytes, totalBytes }) {
  return (
    <div className="absolute inset-0 z-[10002] flex items-center justify-center">
      <div className="w-[320px] rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl p-6 text-center">
        <div className="text-sm tracking-widest text-blue-400 mb-4">LOADING PDF</div>
        <div className="relative h-2 rounded-full overflow-hidden bg-white/10">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 text-xs text-blue-300 font-mono">
          {totalBytes
            ? `${progress}% • ${formatBytes(receivedBytes)} / ${formatBytes(totalBytes)}`
            : `Downloaded ${formatBytes(receivedBytes)}`}
        </div>
      </div>
    </div>
  );
}
