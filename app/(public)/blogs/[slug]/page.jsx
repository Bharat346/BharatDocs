import { getBlogBySlug } from "@/lib/db/blog-queries";
import { getProcessedMDX } from "@/lib/mdx";
import { notFound } from "next/navigation";
import BlogReaderClient from "@/components/BlogPage/BlogReaderClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: "Blog Not Found" };

  return {
    title: `${blog.title} | BharatDocs Blog`,
    description: blog.description,
    alternates: { canonical: `https://bhdocs.in/blogs/${slug}` },
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: "article",
      publishedTime: blog.publishedAt,
      authors: [blog.author],
      images: blog.coverImage ? [{ url: blog.coverImage }] : [],
    },
  };
}

export default async function BlogSlugPage({ params }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) notFound();

  let mdxResult = null;
  try {
    mdxResult = await getProcessedMDX(blog.githubPath);
  } catch (e) {
    console.error("Blog MDX compile error:", e);
  }

  return (
    <BlogReaderClient
      blog={blog}
      mdxContent={mdxResult?.content || null}
      headings={mdxResult?.headings || []}
    />
  );
}
