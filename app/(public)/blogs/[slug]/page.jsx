import { notFound } from "next/navigation";
import BlogReader from "@/components/blogs/BlogReader";
import { getCachedBlogBySlug, getBlogTags } from "@/lib/db/queries/blogs";
import { getProcessedMDX } from "@/lib/mdx";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getCachedBlogBySlug(slug);

  if (!blog) return { title: "Not Found" };

  return {
    title: blog.title,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description,
      images: blog.coverImage ? [blog.coverImage] : [],
      type: "article",
      publishedTime: blog.publishedAt,
      authors: [blog.author],
    },
  };
}

export default async function BlogSlugPage({ params }) {
  const { slug } = await params;

  const blog = await getCachedBlogBySlug(slug);
  if (!blog) notFound();

  const tags = await getBlogTags(blog.id);

  // Compile MDX
  let content, headings;
  try {
    const mdxResult = await getProcessedMDX(blog.githubPath);
    content = mdxResult.content;
    headings = mdxResult.headings;
  } catch (error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <div className="max-w-2xl text-center border border-red-500/20 bg-red-500/10 p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error loading article</h2>
          <p className="text-[var(--fg-secondary)]">{error.message}</p>
        </div>
      </div>
    );
  }

  return <><BlogReader blog={{ ...blog, tags }} content={content} headings={headings} /></>;
}
