import "./globals.css";
import Script from "next/script";

import NonceProvider from "./_nonce/NonceProvider.server";
import ClientRoot from "./ClientRoot";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NonceProvider>
          {(nonce) => (
            <>
              {/* CSP-safe script */}
              <Script
                nonce={nonce}
                strategy="beforeInteractive"
                id="csp-nonce"
              />

              {/* Client boundary starts */}
              <ClientRoot nonce={nonce}>
                {children}
              </ClientRoot>
            </>
          )}
        </NonceProvider>
      </body>
    </html>
  );
}
