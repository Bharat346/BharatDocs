import { db } from "../index.js";
import { tags, docTags, noteTags, blogTags, docs, notes, blogs } from "../schema.js";
import { eq, and, sql } from "drizzle-orm";
import { cached } from "@/lib/cache/lru";
import { createDataCache } from "@/lib/cache/data-cache";

/* ── Get all tags with usage counts across all content types ── */
async function _getAllTags() {
  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      color: tags.color,
    })
    .from(tags)
    .orderBy(tags.name);

  // Enrich with per-type counts
  const enriched = await Promise.all(
    result.map(async (tag) => {
      const [docCount] = await db
        .select({ count: sql`COUNT(*)`.as("count") })
        .from(docTags)
        .innerJoin(docs, and(eq(docs.id, docTags.docId), eq(docs.isPublished, true)))
        .where(eq(docTags.tagId, tag.id));

      const [noteCount] = await db
        .select({ count: sql`COUNT(*)`.as("count") })
        .from(noteTags)
        .innerJoin(notes, and(eq(notes.id, noteTags.noteId), eq(notes.isPublished, true)))
        .where(eq(noteTags.tagId, tag.id));

      const [blogCount] = await db
        .select({ count: sql`COUNT(*)`.as("count") })
        .from(blogTags)
        .innerJoin(blogs, and(eq(blogs.id, blogTags.blogId), eq(blogs.isPublished, true)))
        .where(eq(blogTags.tagId, tag.id));

      return {
        ...tag,
        docCount: Number(docCount?.count || 0),
        noteCount: Number(noteCount?.count || 0),
        blogCount: Number(blogCount?.count || 0),
        totalCount:
          Number(docCount?.count || 0) +
          Number(noteCount?.count || 0) +
          Number(blogCount?.count || 0),
      };
    }),
  );

  // Only return tags that have at least one published item
  return enriched.filter((t) => t.totalCount > 0);
}

export async function getAllTags() {
  return cached("tags", "all-tags", _getAllTags);
}

export const getCachedAllTags = createDataCache(
  getAllTags,
  ["all-tags"],
  { revalidate: 3600, tags: ["tags"] },
);
