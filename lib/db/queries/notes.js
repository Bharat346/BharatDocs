import { db } from "../index.js";
import { notes, noteTags, tags } from "../schema.js";
import { eq, and, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { cached } from "@/lib/cache/lru";
import { createDataCache } from "@/lib/cache/data-cache";
import { inflightManager } from "@/lib/inflight/manager";

const childNotes = alias(notes, "child_notes");

/* ── List notes by parent slug with subfolder counts ── */
async function _getNotesByParentSlug(parentSlug = null, tagSlug = null) {
  const conditions = [eq(notes.isPublished, true)];

  if (parentSlug === null || parentSlug === "null") {
    conditions.push(isNull(notes.parentId));
  } else {
    const parent = await db
      .select({ id: notes.id })
      .from(notes)
      .where(and(eq(notes.slug, parentSlug), eq(notes.isPublished, true)))
      .limit(1);

    if (!parent.length) return [];
    conditions.push(eq(notes.parentId, parent[0].id));
  }

  const result = await db
    .select({
      id: notes.id,
      parentId: notes.parentId,
      name: notes.name,
      slug: notes.slug,
      type: notes.type,
      fileType: notes.fileType,
      filePath: notes.filePath,
      fileSize: notes.fileSize,
      description: notes.description,
      isPublished: notes.isPublished,
      updatedAt: notes.updatedAt,
      subFolderCount: sql`COUNT(DISTINCT ${childNotes.id})`.as("subFolderCount"),
    })
    .from(notes)
    .leftJoin(
      childNotes,
      and(
        eq(childNotes.parentId, notes.id),
        eq(childNotes.type, "folder"),
        eq(childNotes.isPublished, true),
      ),
    )
    .where(and(...conditions))
    .groupBy(notes.id)
    .orderBy(notes.orderIndex, notes.name);

  // Tag filter
  if (tagSlug) {
    const tagRow = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, tagSlug))
      .limit(1);

    if (!tagRow.length) return [];

    const taggedIds = await db
      .select({ noteId: noteTags.noteId })
      .from(noteTags)
      .where(eq(noteTags.tagId, tagRow[0].id));

    const idSet = new Set(taggedIds.map((r) => r.noteId));
    return result.filter((n) => idSet.has(n.id));
  }

  return result;
}

export async function getNotesByParentSlug(parentSlug, tagSlug) {
  const key = `notes:${parentSlug || "root"}:${tagSlug || "all"}`;
  return inflightManager.execute(
    { customKey: `getNotesByParentSlug:${parentSlug}:${tagSlug}` },
    () => cached("queries", key, () => _getNotesByParentSlug(parentSlug, tagSlug))
  );
}

export const getCachedNotesByParentSlug = createDataCache(
  getNotesByParentSlug,
  ["notes-list"],
  { revalidate: 300, tags: ["notes"] },
);

/* ── Single note by slug ── */
async function _getNoteBySlug(slug) {
  const result = await db
    .select()
    .from(notes)
    .where(and(eq(notes.slug, slug), eq(notes.isPublished, true)))
    .limit(1);

  return result[0] || null;
}

export async function getNoteBySlug(slug) {
  return inflightManager.execute(
    { customKey: `getNoteBySlug:${slug}` },
    () => cached("queries", `note:${slug}`, () => _getNoteBySlug(slug))
  );
}

/* ── Get tags for a note ── */
export async function getNoteTags(noteId) {
  return db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      color: tags.color,
    })
    .from(noteTags)
    .innerJoin(tags, eq(tags.id, noteTags.tagId))
    .where(eq(noteTags.noteId, noteId));
}

/* ── Get all notes ── */
async function _getAllNotes() {
  return db
    .select({
      id: notes.id,
      parentId: notes.parentId,
      name: notes.name,
      slug: notes.slug,
      type: notes.type,
      fileType: notes.fileType,
      filePath: notes.filePath,
      description: notes.description,
      orderIndex: notes.orderIndex,
      updatedAt: notes.updatedAt,
    })
    .from(notes)
    .where(eq(notes.isPublished, true))
    .orderBy(notes.orderIndex, notes.name);
}

export async function getAllNotes() {
  return inflightManager.execute(
    { customKey: `getAllNotes` },
    () => cached("queries", "notes:all", _getAllNotes)
  );
}

export const getCachedAllNotes = createDataCache(
  getAllNotes,
  ["notes-all"],
  { revalidate: 300, tags: ["notes"] },
);
