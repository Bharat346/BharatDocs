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
      <head>
        <script
          id="theme-init"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
        (function() {
          try {
            const stored = localStorage.getItem("theme");
            const theme = stored === "dark" ? "dark" : "light";
            if (theme === "dark") {
              document.documentElement.classList.add("dark");
            }
          } catch (e) {}
        })();
      `,
          }}
        />
      </head>

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
