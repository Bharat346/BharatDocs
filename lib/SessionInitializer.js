// lib/SessionInitializer.js
"use client";

import { useEffect } from "react";

export default function SessionInitializer() {
  useEffect(() => {
    // Call only once when user lands
    fetch("/api/session", {
      method: "GET",
      credentials: "include",
    });
  }, []);

  return null;
}
