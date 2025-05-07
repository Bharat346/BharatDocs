import { useState } from 'react';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

const NetworkErrorAlert = () => {
  const [isHotspotOn, setIsHotspotOn] = useState(false);
  const [isWifiOn, setIsWifiOn] = useState(true);

  const toggleHotspot = () => {
    setIsHotspotOn(!isHotspotOn);
    if (!isHotspotOn) {
      setIsWifiOn(false);
    }
  };

  const toggleWifi = () => {
    setIsWifiOn(!isWifiOn);
    if (isWifiOn && isHotspotOn) {
      setIsHotspotOn(false);
    }
  };

  return (
    <div className="col-span-full mx-auto mt-4 w-fit max-w-md rounded-xl border border-blue-600/50 bg-blue-900/20 p-4 shadow-md backdrop-blur-sm">
      <div className="flex items-start">
        <AlertCircle className="flex-shrink-0 h-5 w-5 mt-0.5 mr-3 text-blue-400 animate-pulse" />
        <div className="text-sm text-blue-200">
          <h3 className="mb-1 font-semibold text-blue-300">
            Network Connection Issue
          </h3>
          <p className="mb-3">
            We're having trouble connecting. Try these troubleshooting steps:
          </p>
          
          <div className="space-y-3">
            {/* Hotspot Toggle */}
            <button 
              onClick={toggleHotspot}
              className={`flex items-center gap-2 w-full p-2 rounded-lg transition-all ${isHotspotOn ? 'bg-blue-800/50 text-blue-100' : 'hover:bg-blue-900/30 text-blue-300'}`}
            >
              <div className={`p-1 rounded-full ${isHotspotOn ? 'bg-blue-500/20' : 'bg-blue-900/30'}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14M12 5v14"
                    className={isHotspotOn ? 'hidden' : 'block'}
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 11c1.657 0 3-1.343 3-3V5a3 3 0 10-6 0v3c0 1.657 1.343 3 3 3zm0 0v7m0 0h-3m3 0h3"
                    className={isHotspotOn ? 'block text-blue-400' : 'hidden'}
                  />
                </svg>
              </div>
              <span>{isHotspotOn ? 'Personal Hotspot Active' : 'Turn On Personal Hotspot'}</span>
            </button>

            {/* Wifi Toggle */}
            <button 
              onClick={toggleWifi}
              className={`flex items-center gap-2 w-full p-2 rounded-lg transition-all ${!isWifiOn ? 'bg-blue-800/50 text-blue-100' : 'hover:bg-blue-900/30 text-blue-300'}`}
            >
              <div className={`p-1 rounded-full ${!isWifiOn ? 'bg-blue-500/20' : 'bg-blue-900/30'}`}>
                {isWifiOn ? (
                  <Wifi className="h-5 w-5" />
                ) : (
                  <WifiOff className="h-5 w-5 text-blue-400" />
                )}
              </div>
              <span>{isWifiOn ? 'Turn Off WiFi' : 'Turn On WiFi'}</span>
            </button>
          </div>

          {isHotspotOn && (
            <div className="mt-3 text-xs text-blue-400 flex items-center gap-1">
              <svg className="h-3 w-3 animate-pulse" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" />
              </svg>
              Using mobile data may incur additional charges
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkErrorAlert;