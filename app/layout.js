// app/layout.js
import "katex/dist/katex.min.css";
import "./globals.css";
import "@/styles/custom.css";
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
        <link rel="preconnect" href="https://raw.githubusercontent.com" />
        <link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
        {/* Guaranteed KaTeX fonts for perfect math rendering */}
        <script
          id="theme-init"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
        (function() {
          try {
            const raw = localStorage.getItem("theme-storage");
            let theme = "dark";
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed && parsed.state && parsed.state.theme) {
                theme = parsed.state.theme;
              }
            } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
              theme = "light";
            }
            
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
