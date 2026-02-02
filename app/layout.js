import { Open_Sans, Roboto } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import QueryProvider from "@/components/QueryProvider";
import SessionInitializer from "@/lib/SessionInitializer";

// Optimize font loading with Open Sans as primary, Roboto as secondary
const openSans = Open_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  fallback: ["system-ui", "Arial", "sans-serif"],
});

const roboto = Roboto({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  fallback: ["system-ui", "Arial", "sans-serif"],
});

export const metadata = {
  title: {
    default: "Bharat Docs",
    template: "%s | Bharat Docs",
  },

  description:
    "Bharat Docs is a modern platform for organizing, reading, and exploring documents and notes with speed, clarity, and collaboration in mind.",

  applicationName: "Bharat Docs",

  keywords: [
    "Bharat Docs",
    "Documentation Platform",
    "Notes App",
    "Knowledge Base",
    "Document Management",
    "Next.js Docs",
    "Personal Wiki",
    "Technical Documentation",
  ],

  authors: [{ name: "Bharat Kumar" }],

  creator: "Bharat Kumar",
  publisher: "Bharat Docs",

  metadataBase: new URL("https://bhdocs.in"),

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Bharat Docs",
    description:
      "Organize, read, and explore your documents and notes with a clean, modern, and powerful documentation platform.",
    url: "https://bhdocs.in",
    siteName: "Bharat Docs",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bharat Docs – Documentation Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Bharat Docs",
    description:
      "A modern platform for organizing, reading, and exploring documents and notes.",
    images: ["/og-image.png"],
    creator: "@bharat",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  manifest: "/site.webmanifest",
  category: "technology",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${openSans.variable} ${roboto.variable}`}
    >
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href={openSans.variable}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href={roboto.variable}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 min-h-screen">
        <ThemeProvider>
          <QueryProvider>
            <NavBar />
            <SessionInitializer />
            <main className="overflow-hidden">{children}</main>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}