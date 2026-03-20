import PDFViewerClient from "@/components/PDFViewerPage/PDFViewerClient";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const path = resolvedParams.path || [];
  const fileName = path.at(-1) || "Document";

  return {
    title: `View ${fileName} - BH Docs`,
    description: `Read and explore the PDF document: ${fileName} on BH Docs.`,
  };
}

export default async function PDFPage({ params }) {
  const resolvedParams = await params;
  return <PDFViewerClient path={resolvedParams.path} />;
}
