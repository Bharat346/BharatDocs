import { db } from "../index.js";
import { docs, docTags, tags } from "../schema.js";
import { eq, and, isNull, desc, sql } from "drizzle-orm";
import { cached } from "@/lib/cache/lru";
import { createDataCache } from "@/lib/cache/data-cache";
import { globalCoalescer } from "@/lib/coalescer/index.js";

/* ── List docs by parent slug with optional tag filter ── */
async function _getDocsByParentSlug(parentSlug = null, tagSlug = null) {
  const conditions = [eq(docs.isPublished, true)];

  if (parentSlug === null || parentSlug === "null") {
    conditions.push(isNull(docs.parentId));
  } else {
    // Find parent by slug, then filter children
    const parent = await db
      .select({ id: docs.id })
      .from(docs)
      .where(and(eq(docs.slug, parentSlug), eq(docs.isPublished, true)))
      .limit(1);

    if (!parent.length) return [];
    conditions.push(eq(docs.parentId, parent[0].id));
  }

  let query = db
    .select({
      id: docs.id,
      parentId: docs.parentId,
      name: docs.name,
      slug: docs.slug,
      type: docs.type,
      fileType: docs.fileType,
      filePath: docs.filePath,
      description: docs.description,
      orderIndex: docs.orderIndex,
      updatedAt: docs.updatedAt,
    })
    .from(docs)
    .where(and(...conditions))
    .orderBy(docs.orderIndex, docs.name);

  const result = await query;

  // If tag filter requested, filter by junction table
  if (tagSlug) {
    const tagRow = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, tagSlug))
      .limit(1);

    if (!tagRow.length) return [];

    const taggedDocIds = await db
      .select({ docId: docTags.docId })
      .from(docTags)
      .where(eq(docTags.tagId, tagRow[0].id));

    const idSet = new Set(taggedDocIds.map((r) => r.docId));
    return result.filter((d) => idSet.has(d.id));
  }

  return result;
}

export async function getDocsByParentSlug(parentSlug, tagSlug) {
  const key = `docs:${parentSlug || "root"}:${tagSlug || "all"}`;
  return globalCoalescer.execute(
    { route: 'getDocsByParentSlug', queryParams: { parentSlug, tagSlug } },
    () => cached("queries", key, () => _getDocsByParentSlug(parentSlug, tagSlug))
  );
}

export const getCachedDocsByParentSlug = createDataCache(
  getDocsByParentSlug,
  ["docs-list"],
  { revalidate: 300, tags: ["docs"] },
);

/* ── Get all docs ── */
async function _getAllDocs() {
  return db
    .select({
      id: docs.id,
      parentId: docs.parentId,
      name: docs.name,
      slug: docs.slug,
      type: docs.type,
      fileType: docs.fileType,
      filePath: docs.filePath,
      description: docs.description,
      orderIndex: docs.orderIndex,
      updatedAt: docs.updatedAt,
    })
    .from(docs)
    .where(eq(docs.isPublished, true))
    .orderBy(docs.orderIndex, docs.name);
}

export async function getAllDocs() {
  return globalCoalescer.execute(
    { route: 'getAllDocs' },
    () => cached("queries", "docs:all", _getAllDocs)
  );
}

export const getCachedAllDocs = createDataCache(
  getAllDocs,
  ["docs-all"],
  { revalidate: 300, tags: ["docs"] },
);

/* ── Recent docs (for homepage) ── */
async function _getRecentDocs(limit = 6) {
  return db
    .select({
      id: docs.id,
      name: docs.name,
      slug: docs.slug,
      type: docs.type,
      fileType: docs.fileType,
      description: docs.description,
      updatedAt: docs.updatedAt,
    })
    .from(docs)
    .where(and(eq(docs.isPublished, true), eq(docs.type, "document")))
    .orderBy(desc(docs.updatedAt))
    .limit(limit);
}

export async function getRecentDocs(limit = 6) {
  return globalCoalescer.execute(
    { route: 'getRecentDocs', queryParams: { limit } },
    () => cached("queries", `docs:recent:${limit}`, () => _getRecentDocs(limit))
  );
}

export const getCachedRecentDocs = createDataCache(
  getRecentDocs,
  ["docs-recent"],
  { revalidate: 300, tags: ["docs"] },
);

/* ── Get tags for a specific doc ── */
export async function getDocTags(docId) {
  return db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      color: tags.color,
    })
    .from(docTags)
    .innerJoin(tags, eq(tags.id, docTags.tagId))
    .where(eq(docTags.docId, docId));
}
