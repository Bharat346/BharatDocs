import { db } from "../index.js";
import { blogs, blogTags, tags } from "../schema.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { cached } from "@/lib/cache/lru";
import { createDataCache } from "@/lib/cache/data-cache";

/* ── Published blog listing ── */
async function _getPublishedBlogs({ tagSlug = null, limit = 50, offset = 0 } = {}) {
  const conditions = [eq(blogs.isPublished, true)];

  let baseQuery = db
    .select({
      id: blogs.id,
      slug: blogs.slug,
      title: blogs.title,
      description: blogs.description,
      coverImage: blogs.coverImage,
      author: blogs.author,
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

  let result = await baseQuery;

  // Tag filter via junction table
  if (tagSlug) {
    const tagRow = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, tagSlug))
      .limit(1);

    if (!tagRow.length) return [];

    const taggedIds = await db
      .select({ blogId: blogTags.blogId })
      .from(blogTags)
      .where(eq(blogTags.tagId, tagRow[0].id));

    const idSet = new Set(taggedIds.map((r) => r.blogId));
    result = result.filter((b) => idSet.has(b.id));
  }

  return result;
}

export async function getPublishedBlogs(opts) {
  const key = `blogs:list:${opts?.tagSlug || "all"}:${opts?.limit || 50}:${opts?.offset || 0}`;
  return cached("queries", key, () => _getPublishedBlogs(opts));
}

export const getCachedPublishedBlogs = createDataCache(
  getPublishedBlogs,
  ["blogs-list"],
  { revalidate: 300, tags: ["blogs"] },
);

/* ── Single blog by slug ── */
async function _getBlogBySlug(slug) {
  const result = await db
    .select()
    .from(blogs)
    .where(and(eq(blogs.slug, slug), eq(blogs.isPublished, true)))
    .limit(1);

  return result[0] || null;
}

export async function getBlogBySlug(slug) {
  return cached("queries", `blog:${slug}`, () => _getBlogBySlug(slug));
}

export const getCachedBlogBySlug = createDataCache(
  getBlogBySlug,
  ["blog-detail"],
  { revalidate: 3600, tags: ["blogs"] },
);

/* ── Featured blogs (homepage) ── */
async function _getFeaturedBlogs(limit = 3) {
  return db
    .select({
      id: blogs.id,
      slug: blogs.slug,
      title: blogs.title,
      description: blogs.description,
      coverImage: blogs.coverImage,
      author: blogs.author,
      readTime: blogs.readTime,
      publishedAt: blogs.publishedAt,
    })
    .from(blogs)
    .where(and(eq(blogs.isPublished, true), eq(blogs.isFeatured, true)))
    .orderBy(desc(blogs.publishedAt))
    .limit(limit);
}

export async function getFeaturedBlogs(limit = 3) {
  return cached("queries", `blogs:featured:${limit}`, () => _getFeaturedBlogs(limit));
}

/* ── Get tags for a blog ── */
export async function getBlogTags(blogId) {
  return db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      color: tags.color,
    })
    .from(blogTags)
    .innerJoin(tags, eq(tags.id, blogTags.tagId))
    .where(eq(blogTags.blogId, blogId));
}

/* ── Get all blog tags (for filter UI) ── */
async function _getAllBlogTags() {
  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      color: tags.color,
      count: sql`COUNT(${blogTags.blogId})`.as("count"),
    })
    .from(tags)
    .innerJoin(blogTags, eq(blogTags.tagId, tags.id))
    .innerJoin(blogs, and(eq(blogs.id, blogTags.blogId), eq(blogs.isPublished, true)))
    .groupBy(tags.id)
    .orderBy(tags.name);

  return result;
}

export async function getAllBlogTags() {
  return cached("tags", "blog-tags", _getAllBlogTags);
}
