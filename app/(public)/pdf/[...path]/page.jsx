import PDFViewerClient from "@/components/PDFViewerPage/PDFViewerClient";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const path = resolvedParams.path || [];
  const fileName = path.at(-1) || "Document";

  const canonical = `https://bhdocs.in/pdf/${path.join("/")}`;
  const title = `View ${fileName.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} - BH Docs`;

  return {
    title,
    description: `Read and explore the PDF document: ${fileName} on BH Docs. High-quality computer science notes and resources.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description: `Read and explore the PDF document: ${fileName} on BH Docs.`,
      url: canonical,
      siteName: "BH Docs",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: `Read and explore the PDF document: ${fileName} on BH Docs.`,
    },
  };
}

export default async function PDFPage({ params }) {
  const resolvedParams = await params;
  return <PDFViewerClient path={resolvedParams.path} />;
}
