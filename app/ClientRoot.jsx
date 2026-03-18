"use client";

import NavBar from "@/components/navbar/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import QueryProvider from "@/components/QueryProvider";
import SessionInitializer from "@/lib/SessionInitializer";
import { usePathname } from "next/navigation";

export default function ClientRoot({ children, nonce }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <ThemeProvider>
      <QueryProvider>
        {!isAdmin && <NavBar />}
        <SessionInitializer />
        <main>{children}</main>
      </QueryProvider>
    </ThemeProvider>
  );
}
