export default function PDFHelpDialog({ onClose, theme }) {
  const isDark = theme === "dark";

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10007]">
      <div className={`p-6 rounded-2xl w-[320px] shadow-2xl border ${
        isDark ? "bg-zinc-900 text-white border-white/10" : "bg-white text-gray-900 border-gray-200"
      }`}>
        <h3 className="font-bold mb-5 flex items-center gap-2">
           <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
           Keyboard Shortcuts
        </h3>
        <ul className="space-y-3 text-sm">
          <li className={`flex justify-between items-center p-2.5 rounded-xl border ${
             isDark ? "bg-zinc-800/50 border-white/5 text-zinc-400" : "bg-gray-50 border-gray-100 text-gray-600"
          }`}>
             <span className="text-blue-500 font-mono font-bold tracking-tighter">← / →</span> 
             <span>Prev / Next Page</span>
          </li>
          <li className={`flex justify-between items-center p-2.5 rounded-xl border ${
             isDark ? "bg-zinc-800/50 border-white/5 text-zinc-400" : "bg-gray-50 border-gray-100 text-gray-600"
          }`}>
             <span className="text-blue-500 font-mono font-bold tracking-tighter">↑ / ↓</span> 
             <span>Slide / Scroll Page</span>
          </li>
          <li className={`flex justify-between items-center p-2.5 rounded-xl border ${
             isDark ? "bg-zinc-800/50 border-white/5 text-zinc-400" : "bg-gray-50 border-gray-100 text-gray-600"
          }`}>
             <span className="text-blue-500 font-mono font-bold tracking-tighter">+ / -</span> 
             <span>Zoom In / Out</span>
          </li>
        </ul>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-blue-500/20"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
