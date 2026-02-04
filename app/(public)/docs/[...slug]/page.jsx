import DocsSlugClient from "@/components/DocsPage/client/DocsSlugClient";

/* ---------------- Dynamic SEO ---------------- */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slugArray = resolvedParams?.slug;

  // Guard against assets / bad routes
  if (!Array.isArray(slugArray) || slugArray.length === 0) {
    return {
      title: "Documentation",
      description:
        "Developer documentation and guides for modern web technologies on BH Docs.",
      alternates: {
        canonical: "https://bhdocs.in/docs",
      },
    };
  }

  const slugPath = slugArray.join("/");

  const readableTitle = slugArray
    .slice(-1)[0]
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const title = `${readableTitle} Documentation`;
  const description = `Complete documentation and guides for ${readableTitle}. Learn with structured, developer-focused notes on BH Docs.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://bhdocs.in/docs/${slugPath}`,
    },
    openGraph: {
      title,
      description,
      url: `https://bhdocs.in/docs/${slugPath}`,
      siteName: "BH Docs",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* ---------------- Page ---------------- */
export default async function DocsSlugPage({ params }) {
  const resolvedParams = await params;
  const slugArray = resolvedParams?.slug || [];
  const slugPath = Array.isArray(slugArray) ? slugArray.join("/") : "";

  return <DocsSlugClient slug={slugPath} />;
}
