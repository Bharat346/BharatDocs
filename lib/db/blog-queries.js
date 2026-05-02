import { db } from "./index.js";
import { blogs } from "./schema.js";
import { eq, desc, and, sql, asc } from "drizzle-orm";

/* ── Published blog listing (public, cached-friendly) ── */
export async function getPublishedBlogs({ tag = null, limit = 50, offset = 0 } = {}) {
  const conditions = [eq(blogs.isPublished, true)];

  if (tag) {
    conditions.push(sql`${blogs.tags} @> ARRAY[${tag}]::text[]`);
  }

  return db
    .select({
      id: blogs.id,
      slug: blogs.slug,
      title: blogs.title,
      description: blogs.description,
      coverImage: blogs.coverImage,
      author: blogs.author,
      tags: blogs.tags,
      readTime: blogs.readTime,
      isFeatured: blogs.isFeatured,
      publishedAt: blogs.publishedAt,
      createdAt: blogs.createdAt,
    })
    .from(blogs)
    .where(and(...conditions))
    .orderBy(desc(blogs.isFeatured), desc(blogs.publishedAt))
    .limit(limit)
    .offset(offset);
}

/* ── Single blog by slug (public) ── */
export async function getBlogBySlug(slug) {
  const result = await db
    .select()
    .from(blogs)
    .where(and(eq(blogs.slug, slug), eq(blogs.isPublished, true)))
    .limit(1);

  return result[0] || null;
}

/* ── All blogs for admin (includes unpublished) ── */
export async function getAllBlogsAdmin() {
  return db
    .select()
    .from(blogs)
    .orderBy(desc(blogs.updatedAt));
}

/* ── Create blog ── */
export async function createBlog(data) {
  const result = await db.insert(blogs).values({
    slug: data.slug,
    title: data.title,
    description: data.description,
    coverImage: data.coverImage || null,
    githubPath: data.githubPath,
    author: data.author || "Bharat",
    tags: data.tags || [],
    readTime: data.readTime || 5,
    isPublished: data.isPublished || false,
    isFeatured: data.isFeatured || false,
    publishedAt: data.isPublished ? new Date() : null,
  }).returning();

  return result[0];
}

/* ── Update blog ── */
export async function updateBlog(id, data) {
  const updateData = { ...data, updatedAt: new Date() };

  // If publishing for first time, set publishedAt
  if (data.isPublished && !data.publishedAt) {
    updateData.publishedAt = new Date();
  }

  const result = await db
    .update(blogs)
    .set(updateData)
    .where(eq(blogs.id, id))
    .returning();

  return result[0];
}

/* ── Delete blog ── */
export async function deleteBlog(id) {
  return db.delete(blogs).where(eq(blogs.id, id));
}

/* ── Get all unique tags ── */
export async function getAllBlogTags() {
  const result = await db
    .select({ tags: blogs.tags })
    .from(blogs)
    .where(eq(blogs.isPublished, true));

  const tagSet = new Set();
  result.forEach((row) => {
    (row.tags || []).forEach((t) => tagSet.add(t));
  });

  return Array.from(tagSet).sort();
}

/* ── Featured blogs (for homepage) ── */
export async function getFeaturedBlogs(limit = 3) {
  return db
    .select({
      id: blogs.id,
      slug: blogs.slug,
      title: blogs.title,
      description: blogs.description,
      coverImage: blogs.coverImage,
      author: blogs.author,
      tags: blogs.tags,
      readTime: blogs.readTime,
      publishedAt: blogs.publishedAt,
    })
    .from(blogs)
    .where(and(eq(blogs.isPublished, true), eq(blogs.isFeatured, true)))
    .orderBy(desc(blogs.publishedAt))
    .limit(limit);
}
