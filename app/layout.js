// app/layout.js
import "./globals.css";
import Script from "next/script";
import { headers } from "next/headers";

import ClientRoot from "./ClientRoot";
import PdfWorkerPreload from "@/lib/PDF/PdfWorkerPreload.client";

export default function RootLayout({ children }) {
  // Server-only: get headers as object
  const h = headers();
  const nonce = h["x-nonce"] ?? ""; // <- no .get()

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* 🔒 CSP-safe inline script */}
        <Script
          id="csp-nonce"
          nonce={nonce}
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `self.__next_nonce=${JSON.stringify(nonce)};`,
          }}
        />

        {/* 🔒 Preload PDF worker with nonce */}
        <Script
          id="pdf-worker-preload"
          nonce={nonce}
          strategy="beforeInteractive"
          src="/pdf.worker.min.js"
        />

        {/* 🔥 Everything else is purely client-side */}
        <ClientRoot>
          <PdfWorkerPreload />
          {children}
        </ClientRoot>
      </body>
    </html>
  );
}
