import NotesPathClient from "@/components/NotesPage/client/notes.path.client";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;

  const slugArray = Array.isArray(resolvedParams?.path)
    ? resolvedParams.path
    : [];

  const lastSlug = slugArray.at(-1);

  const title = lastSlug
    ? `${lastSlug.toUpperCase()} Notes & PDFs`
    : "Free CS Notes & Documentation";

  const description = lastSlug
    ? `Browse free ${lastSlug} notes, PDFs, and documentation for students and developers on BH Docs.`
    : "Browse free computer science notes, PDFs, and developer documentation on BH Docs.";

  const canonical =
    "https://bhdocs.in/notes" +
    (slugArray.length ? `/${slugArray.join("/")}` : "");

  return {
    title,
    description,

    keywords: [
      "computer science notes",
      "cs notes pdf",
      "engineering notes",
      "free programming notes",
      lastSlug && `${lastSlug} notes`,
      lastSlug && `${lastSlug} pdf`,
      lastSlug && `${lastSlug} documentation`,
    ].filter(Boolean),

    alternates: {
      canonical,
    },

    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "BH Docs",
      type: "website",
      images: [
        {
          url: "https://bhdocs.in/og/notes.png",
          width: 1200,
          height: 630,
          alt: "BH Docs – Free Computer Science Notes",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://bhdocs.in/og/notes.png"],
    },
  };
}

export default function NotesPathPage({ params }) {
  return <NotesPathClient params={params} />;
}
