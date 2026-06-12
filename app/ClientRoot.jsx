"use client";

import NavBar from "@/components/navbar/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import QueryProvider from "@/components/QueryProvider";
import SessionInitializer from "@/lib/SessionInitializer";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
export default function ClientRoot({ children, nonce }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isPdf = pathname.startsWith("/pdf");
  const isDocsContent = pathname.startsWith("/docs/");
  const showChrome = !isAdmin && !isPdf && !isDocsContent;

  return (
    <ThemeProvider>
      <QueryProvider>
        {!isAdmin && !isPdf && !isDocsContent && <NavBar />}
        <SessionInitializer />
        <main className="min-h-screen flex flex-col">
          <div className="flex-1 overflow-visible">{children}</div>
          {showChrome && <Footer />}
        </main>
      </QueryProvider>
    </ThemeProvider>
  );
}
