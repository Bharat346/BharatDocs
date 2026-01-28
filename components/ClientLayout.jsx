"use client";

import NavBar from "@/components/NavBar";
import { useThemeContext } from "@/components/ThemeProvider";

export default function ClientLayout({ children }) {
  const { mounted } = useThemeContext();

  if (!mounted) return null;

  return (
    <>
      <NavBar />
      <main className="overflow-hidden">{children}</main>
    </>
  );
}
