import BlogGrid from "@/components/BlogPage/BlogGrid";

export const metadata = {
  title: "Blog | BharatDocs",
  description: "Read articles on tech, engineering, and learning from BharatDocs.",
  alternates: { canonical: "https://bhdocs.in/blogs" },
  openGraph: {
    title: "Blog | BharatDocs",
    description: "Articles on tech, engineering, and learning.",
    url: "https://bhdocs.in/blogs",
    siteName: "BH Docs",
    type: "website",
  },
};

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-background transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <BlogGrid />
      </div>
    </div>
  );
}
