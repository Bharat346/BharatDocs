import Fuse from 'fuse.js';
import { db } from '@/lib/db';
import { nodes, collections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

let searchIndex = null;

export async function getSearchIndex() {
  if (searchIndex) return searchIndex;

  const allNodes = await db
    .select({
      id: nodes.id,
      name: nodes.name,
      slug: nodes.slug,
      nodeType: nodes.nodeType,
      fileType: nodes.fileType,
      parentName: nodes.parentName,
      parentSlug: nodes.parentSlug,
      tags: nodes.tags,
      collectionName: collections.name,
    })
    .from(nodes)
    .innerJoin(collections, eq(collections.id, nodes.collectionId))
    .where(eq(nodes.isPublished, true));

  searchIndex = new Fuse(allNodes, {
    keys: ['name', 'slug', 'parentName', 'tags'],
    threshold: 0.3,
    ignoreLocation: true,
  });

  return searchIndex;
}

export function invalidateSearchIndex() {
  searchIndex = null;
}
