"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackgroundEffects from "@/components/shared/BackgroundEffects";

export default function ClientRoot({ children }) {
  const pathname = usePathname();
  const isViewer = pathname && /^\/(docs|blogs)\/.+/.test(pathname);

  return (
    <ThemeProvider>
      <QueryProvider>
        <div className="flex flex-col min-h-screen relative z-0">
          <BackgroundEffects />
          <Navbar />
          <main className="flex-1 flex flex-col pt-16">
            {children}
          </main>
          {!isViewer && <Footer />}
        </div>
      </QueryProvider>
    </ThemeProvider>
  );
}
