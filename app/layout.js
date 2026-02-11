// app/layout.js
import "./globals.css";
import Script from "next/script";
import { headers } from "next/headers";

import ClientRoot from "./ClientRoot";

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

        {/* 🔥 Everything else is purely client-side */}
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
