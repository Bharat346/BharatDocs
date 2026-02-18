"use client";

import { Spinner } from "@/components/ui/spinner";

export default function LoadingState({ theme }) {
  const isDark = theme === "dark";

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner
        className={`h-10 w-10 ${isDark ? "text-blue-500" : "text-blue-600"}`}
      />
    </div>
  );
}
