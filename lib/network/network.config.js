// lib/network.config.js

/* -----------------------------
   NETWORK INFO
------------------------------ */

export function getNetworkInfo() {
  if (typeof navigator === "undefined") return null;

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (!connection) return null;

  return {
    effectiveType: connection.effectiveType, // '4g' | '3g' | '2g' | 'slow-2g'
    downlink: connection.downlink,           // Mbps
    rtt: connection.rtt,                     // ms
    saveData: connection.saveData,
  };
}

/* -----------------------------
   NETWORK CLASSIFICATION
------------------------------ */

export function getNetworkTier() {
  const info = getNetworkInfo();
  if (!info) return "unknown";

  if (info.saveData) return "constrained";
  if (info.effectiveType === "slow-2g") return "constrained";
  if (info.effectiveType === "2g") return "constrained";
  if (info.effectiveType === "3g") return "moderate";

  return "fast"; // 4g or better
}

/* -----------------------------
   PREFETCH POLICY
------------------------------ */

export function shouldPrefetch() {
  const tier = getNetworkTier();

  return tier === "fast";
}

/* -----------------------------
   IMAGE QUALITY POLICY
------------------------------ */

export function getImageQuality() {
  const tier = getNetworkTier();

  if (tier === "constrained") return 40;
  if (tier === "moderate") return 60;

  return 80;
}

/* -----------------------------
   LAZY LOAD STRATEGY
------------------------------ */

export function shouldAggressivelyLazyLoad() {
  const tier = getNetworkTier();
  return tier !== "fast";
}

/* -----------------------------
   CONCURRENCY LIMIT
------------------------------ */

export function getMaxConcurrentPrefetch() {
  const tier = getNetworkTier();

  if (tier === "constrained") return 0;
  if (tier === "moderate") return 2;

  return 4;
}

/* -----------------------------
   DEVICE CAPABILITY CHECK
------------------------------ */

export function getDeviceMemoryTier() {
  if (typeof navigator === "undefined") return "unknown";

  const memory = navigator.deviceMemory; // in GB

  if (!memory) return "unknown";
  if (memory <= 2) return "low";
  if (memory <= 4) return "mid";

  return "high";
}

/* -----------------------------
   SHOULD USE HEAVY ANIMATIONS?
------------------------------ */

export function allowHeavyAnimations() {
  const networkTier = getNetworkTier();
  const memoryTier = getDeviceMemoryTier();

  if (networkTier === "constrained") return false;
  if (memoryTier === "low") return false;

  return true;
}

