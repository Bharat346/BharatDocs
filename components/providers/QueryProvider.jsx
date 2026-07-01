"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const CACHE_PROFILES = {
  default: { staleTime: 2 * 60 * 1000, gcTime: 30 * 60 * 1000 },
};

export default function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            ...CACHE_PROFILES.default,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/* ── Export cache profiles for per-query usage ── */
export const QUERY_CACHE = {
  listings:      { staleTime: 2 * 60 * 1000,  gcTime: 30 * 60 * 1000 },
  detail:        { staleTime: 5 * 60 * 1000,  gcTime: 60 * 60 * 1000 },
  tags:          { staleTime: 10 * 60 * 1000, gcTime: 60 * 60 * 1000 },
  notifications: { staleTime: 30 * 1000,      gcTime: 5 * 60 * 1000 },
  search:        { staleTime: 0,              gcTime: 5 * 60 * 1000 },
};
