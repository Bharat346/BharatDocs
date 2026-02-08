import DocsClient from "@/components/DocsPage/client/docs.iclient";

export const metadata = {
  title: "Documentation & Guides",
  description:
    "Explore curated developer documentation, guides, and PDFs for React, Next.js, System Design, APIs, and more on BH Docs.",
  alternates: {
    canonical: "https://bhdocs.in/docs",
  },
  openGraph: {
    title: "Developer Documentation & Guides",
    description:
      "High-quality developer documentation, structured notes, and learning resources.",
    url: "https://bhdocs.in/docs",
    siteName: "BH Docs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Documentation & Guides",
    description:
      "Structured developer docs and guides for modern web development.",
  },
};

export default function DocsPage() {
  return <DocsClient />;
}
