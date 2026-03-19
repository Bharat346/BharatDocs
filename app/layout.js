// app/layout.js
import "./globals.css";
import { headers } from "next/headers";
import { Inter } from "next/font/google";

import ClientRoot from "./ClientRoot";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export default async function RootLayout({ children }) {
  // Server-only: get headers as object
  const h = await headers();
  const nonce = h.get("x-nonce") ?? "";

  return (
    <html
      lang="en"
      className={`${inter.variable} ${inter.className}`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="theme-init"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
        (function() {
          try {
            const stored = localStorage.getItem("theme");
            const theme = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
            if (theme === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          } catch (e) {}
        })();
      `,
          }}
        />
      </head>

      <body
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}
      >
        {/* 🔒 CSP-safe inline script - standard tag avoids hydration-mismatch stripped nonce error */}
        <script
          id="csp-nonce"
          nonce={nonce}
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
