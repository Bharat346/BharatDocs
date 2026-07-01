import { db } from "@/lib/db";
import { docs, notes, blogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap() {
  const baseUrl = "https://bhdocs.in";

  // Static routes
  const routes = ["", "/docs", "/notes", "/blogs"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8,
  }));

  try {
    // Dynamic docs
    const allDocs = await db
      .select({ slug: docs.slug, updatedAt: docs.updatedAt })
      .from(docs)
      .where(eq(docs.isPublished, true));
      
    allDocs.forEach((doc) => {
      routes.push({
        url: `${baseUrl}/docs/${doc.slug}`,
        lastModified: doc.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    });

    // Dynamic notes
    const allNotes = await db
      .select({ slug: notes.slug, updatedAt: notes.updatedAt })
      .from(notes)
      .where(eq(notes.isPublished, true));
      
    allNotes.forEach((note) => {
      routes.push({
        url: `${baseUrl}/notes/${note.slug}`,
        lastModified: note.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    });

    // Dynamic blogs
    const allBlogs = await db
      .select({ slug: blogs.slug, updatedAt: blogs.updatedAt })
      .from(blogs)
      .where(eq(blogs.isPublished, true));
      
    allBlogs.forEach((blog) => {
      routes.push({
        url: `${baseUrl}/blogs/${blog.slug}`,
        lastModified: blog.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }

  return routes;
}
