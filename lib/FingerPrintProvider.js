"use client";

import { useEffect } from "react";
import { getFingerprint } from "@/lib/fingerprint";

export default function FingerprintProvider() {
  useEffect(() => {
    (async () => {
      const visitorId = await getFingerprint();
      document.cookie = `fp=${visitorId}; path=/; Secure; SameSite=Lax`;
    })();
  }, []);

  return null; // invisible component
}
