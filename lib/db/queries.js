import { db } from "./index.js";
import { collections, nodes } from "./schema.js";
import { eq, and, isNull, sql } from "drizzle-orm";

export async function getDocsByParentSlug(collectionName = "Docs", parentSlug = null, tag = null) {
  const conditions = [
    eq(nodes.isPublished, true),
    eq(collections.name, collectionName),
  ];

  if (parentSlug === null) {
    conditions.push(isNull(nodes.parentSlug));
  } else {
    conditions.push(eq(nodes.parentSlug, parentSlug));
  }

  if (tag) {
    conditions.push(sql`${nodes.tags} @> ARRAY[${tag}]::text[]`);
  }

  const result = await db
    .select({
      nodeId: nodes.id,
      collectionId: nodes.collectionId,
      parentId: nodes.parentId,
      parentSlug: nodes.parentSlug,
      name: nodes.name,
      slug: nodes.slug,
      nodeType: nodes.nodeType,
      fileType: nodes.fileType,
      filePath: nodes.filePath,
      isPublished: nodes.isPublished,
      orderIndex: nodes.orderIndex,
      updatedAt: nodes.updatedAt,
      tags: nodes.tags,
      collectionName: collections.name,
    })
    .from(nodes)
    .innerJoin(collections, eq(collections.id, nodes.collectionId))
    .where(and(...conditions))
    .orderBy(nodes.orderIndex, nodes.name);

  return result;
}
