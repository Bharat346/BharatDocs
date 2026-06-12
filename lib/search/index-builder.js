import Fuse from 'fuse.js';
import { db } from '@/lib/db';
import { nodes, collections, blogs } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

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

  const allBlogs = await db
    .select({
      id: blogs.id,
      name: blogs.title,
      slug: blogs.slug,
      nodeType: sql`'blog'`,
      fileType: sql`null`,
      parentName: sql`null`,
      parentSlug: sql`null`,
      tags: blogs.tags,
      collectionName: sql`'Blogs'`,
    })
    .from(blogs)
    .where(eq(blogs.isPublished, true));

  const combined = [...allNodes, ...allBlogs];

  searchIndex = new Fuse(combined, {
    keys: ['name', 'slug', 'parentName', 'tags'],
    threshold: 0.3,
    ignoreLocation: true,
  });

  return searchIndex;
}

export function invalidateSearchIndex() {
  searchIndex = null;
}
