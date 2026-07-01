import { Inter } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import ClientRoot from "./ClientRoot";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: {
    template: "%s | BharatDocs",
    default: "BharatDocs - Learning Hub",
  },
  description: "A modern learning hub for documentation, notes, and technical articles.",
  metadataBase: new URL("https://bhdocs.in"),
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let isDark = true;
                const storage = localStorage.getItem('theme-storage');
                if (storage) {
                  const parsed = JSON.parse(storage);
                  isDark = parsed.state.theme === 'dark';
                }
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased overflow-x-hidden`}>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
