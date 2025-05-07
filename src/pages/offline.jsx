// src/pages/OfflinePage.jsx
import React from "react";
import { useDark } from "@/hooks/darkmode.jsx";

const OfflinePage = () => {
  const { isDark } = useDark();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300 ${isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-md w-full text-center space-y-6">
        {/* WiFi Cut SVG Illustration */}
        <div className="w-64 h-64 mx-auto relative">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={isDark ? "#f43f5e" : "#ef4444"} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-full h-full"
          >
            {/* WiFi Symbol */}
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <path d="M12 20h.01" />
            
            {/* Strike-through */}
            <line 
              x1="1" 
              y1="1" 
              x2="23" 
              y2="23" 
              stroke={isDark ? "#f43f5e" : "#ef4444"} 
              strokeWidth="2.5"
            />
            
            {/* Optional: Exclamation mark for emphasis */}
            <circle 
              cx="12" 
              cy="19" 
              r="1" 
              fill={isDark ? "#f43f5e" : "#ef4444"}
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight">
          Connection Lost
        </h1>
        
        <p className={`text-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Your Internet connection appears to be offline
        </p>
        
        <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
          We'll automatically reconnect when network is available
        </p>
        
        <div className="pt-6 flex justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${isDark ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-500 hover:bg-indigo-600"} text-white shadow-md hover:shadow-lg`}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;