import DocsSlugClient from "@/components/DocsPage/client/docs.slug.client";

/* ---------------- Dynamic SEO ---------------- */
export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const slugArray = resolvedParams?.slug || [];
  const childSlugFromUrl = resolvedSearch?.child;

  if (slugArray.length === 0) {
    return { title: "Documentation", description: "Developer documentation." };
  }

  const slugPath = slugArray.join("/");
  
  // Try to get frontmatter for better SEO
  const childrenDocs = await getDocsByParentSlug("Docs", slugPath);
  let selectedChild = childrenDocs[0];
  if (childSlugFromUrl) {
    selectedChild = childrenDocs.find((c) => c.slug === childSlugFromUrl) || selectedChild;
  }

  let title = slugArray.slice(-1)[0].replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  let description = `Documentation for ${title}.`;

  if (selectedChild?.filePath) {
    try {
      const { frontmatter } = await getProcessedMDX(selectedChild.filePath);
      if (frontmatter?.title) title = frontmatter.title;
      if (frontmatter?.description) description = frontmatter.description;
    } catch (e) {
      // Fallback to default
    }
  }

  return {
    title: `${title} | BharatDocs`,
    description,
    alternates: {
      canonical: `https://bhdocs.in/docs/${slugPath}${childSlugFromUrl ? `?child=${childSlugFromUrl}` : ""}`,
    },
    openGraph: {
      title: `${title} | BharatDocs`,
      description,
      type: "article",
    },
  };
}

/* ---------------- Page ---------------- */
import { getDocsByParentSlug } from "@/lib/db/queries";
import { getProcessedMDX } from "@/lib/mdx";

export default async function DocsSlugPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const slugArray = resolvedParams?.slug || [];
  const slugPath = Array.isArray(slugArray) ? slugArray.join("/") : "";
  const childSlugFromUrl = resolvedSearch?.child;

  // 1. Fetch children from DB
  const childrenDocs = await getDocsByParentSlug("Docs", slugPath);
  
  // 2. Determine selected child
  let selectedChild = null;
  if (childrenDocs.length > 0) {
    if (childSlugFromUrl) {
      selectedChild = childrenDocs.find((c) => c.slug === childSlugFromUrl);
    }
    if (!selectedChild) {
      selectedChild = childrenDocs[0];
    }
  }

  // 3. Process MDX
  let mdxResult = null;
  if (selectedChild?.filePath) {
    try {
      mdxResult = await getProcessedMDX(selectedChild.filePath);
    } catch (e) {
      console.error("Failed to process MDX:", e);
    }
  }

  return (
    <DocsSlugClient 
      slug={slugPath} 
      initialChildren={childrenDocs}
      initialSelectedChild={selectedChild}
      initialMdxResult={mdxResult}
    />
  );
}
