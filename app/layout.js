import { Inter, Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import QueryProvider from "@/components/QueryProvider";
import FingerprintProvider from "@/lib/FingerPrintProvider";

// Optimize font loading
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
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

  metadataBase: new URL("https://bharat-docs.com"),

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Bharat Docs",
    description:
      "Organize, read, and explore your documents and notes with a clean, modern, and powerful documentation platform.",
    url: "https://bharat-docs.com",
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
    creator: "@bharat", // optional
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

  // icons: {
  //   icon: "/favicon.ico",
  //   shortcut: "/favicon-16x16.png",
  //   apple: "/apple-touch-icon.png",
  // },

  manifest: "/site.webmanifest",

  category: "technology",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${montserrat.variable} ${poppins.variable}`}
    >
      <body className="font-sans antialiased bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 min-h-screen">
        <ThemeProvider>
          <QueryProvider>
            <NavBar />
            <FingerprintProvider/>
            <main className="overflow-hidden">{children}</main>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
