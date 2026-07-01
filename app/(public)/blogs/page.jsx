import BlogGrid from "@/components/blogs/BlogGrid";
import BlogCard from "@/components/blogs/BlogCard";
import { getCachedPublishedBlogs, getAllBlogTags } from "@/lib/db/queries/blogs";

export const metadata = {
  title: "Technical Blog",
  description: "Technical articles, tutorials, and insights.",
};

export default async function BlogsPage() {
  const blogs = await getCachedPublishedBlogs({ limit: 50, offset: 0 });

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[var(--fg)]">
          Articles
        </h1>
      </div>
      
      {/* Grid with Search Filter */}
      <BlogGrid initialData={{ blogs, total: blogs.length }} />
    </div>
  );
}
