"use client";

import NavBar from "@/components/navbar/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import QueryProvider from "@/components/QueryProvider";
import SessionInitializer from "@/lib/SessionInitializer";
import SplashScreen from "@/components/SplashScreen";
import { usePathname } from "next/navigation";

export default function ClientRoot({ children, nonce }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isPdf = pathname.startsWith("/pdf");

  return (
    <ThemeProvider>
      <QueryProvider>
        <SplashScreen>
          {!isAdmin && !isPdf && <NavBar />}
          <SessionInitializer />
          <main>{children}</main>
        </SplashScreen>
      </QueryProvider>
    </ThemeProvider>
  );
}
