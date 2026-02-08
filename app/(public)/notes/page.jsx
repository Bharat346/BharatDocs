import NotesClient from "@/components/NotesPage/client/notes.iclient";

export const metadata = {
  title: "Notes & Documentation",
  description:
    "Browse free computer science notes and PDFs including DBMS, OS, CN, React, and Next.js on BH Docs.",
  alternates: {
    canonical: "https://bhdocs.in/notes",
  },
  openGraph: {
    title: "Free CS Notes & Documentation | BH Docs",
    description:
      "High-quality computer science notes and developer documentation.",
    url: "https://bhdocs.in/notes",
    siteName: "BH Docs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Notes & Documentation",
    description:
      "High-quality computer science notes and developer documentation.",
  },
  categories: ["Education", "Notes", "Documentation"],
};

export default function NotesPage() {
  return <NotesClient />;
}
