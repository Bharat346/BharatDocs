"use client";

import NavBar from "@/components/navbar/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import QueryProvider from "@/components/QueryProvider";
import SessionInitializer from "@/lib/SessionInitializer";

export default function ClientRoot({ children, nonce }) {
  // nonce is safe to receive as a string
  return (
    <ThemeProvider>
      <QueryProvider>
        <NavBar />
        <SessionInitializer />
        <main className="mt-15">{children}</main>
      </QueryProvider>
    </ThemeProvider>
  );
}
