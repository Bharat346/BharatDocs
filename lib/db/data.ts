import { db } from "./index.js";
import { collections, nodes } from "./schema.js";
import { eq, and, asc } from "drizzle-orm";

export type NodeType = "folder" | "doc" | "note";

export interface TreeNode {
  id: string;
  name: string;
  slug: string | null;
  type: NodeType;
  orderIndex: number;
  parentId: string | null;
  children: TreeNode[];
  filePath?: string | null;
  fileType?: "mdx" | "pdf" | "docx" | null;
  updatedAt?: Date;
}

export async function getTree(collectionName: string): Promise<TreeNode[]> {
  // 1. Get Collection ID
  const collection = await db.query.collections.findFirst({
    where: eq(collections.name, collectionName),
  });

  if (!collection) {
    return [];
  }

  // 2. Fetch all published nodes for this collection
  const allNodes = await db.query.nodes.findMany({
    where: and(
      eq(nodes.collectionId, collection.id),
      eq(nodes.isPublished, true),
    ),
    orderBy: [asc(nodes.orderIndex)],
  });

  // 3. Reconstruct Tree (Adjacency List to Tree)
  const nodeMap = new Map<string, TreeNode>();
  const rootNodes: TreeNode[] = [];

  // First pass: Create TreeNode objects
  allNodes.forEach((node) => {
    nodeMap.set(node.id, {
      id: node.id,
      name: node.name,
      slug: node.slug,
      type: node.nodeType as NodeType,
      orderIndex: node.orderIndex,
      parentId: node.parentId,
      filePath: node.filePath,
      fileType: node.fileType,
      updatedAt: node.updatedAt,
      children: [],
    });
  });

  // Second pass: Link children to parents
  allNodes.forEach((node) => {
    const treeNode = nodeMap.get(node.id)!;
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        parent.children.push(treeNode);
      } else {
        // Parent might not be published or missing, handle gracefully
        // For now, if parent not found, we treat as root or orphan (skipped)
        // If we want to show orphans at root, uncomment:
        // rootNodes.push(treeNode);
      }
    } else {
      rootNodes.push(treeNode);
    }
  });

  // Sort children by orderIndex (though DB sort helps, hierarchy push might mix order)
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.orderIndex - b.orderIndex);
    nodes.forEach((node) => sortNodes(node.children));
  };

  sortNodes(rootNodes);

  return rootNodes;
}

export async function getPageBySlug(slug: string, collectionName: string) {
  // This is simple for now, assuming slug is unique per collection or globally unique enough for docs
  // In complex scenarios, slug might need to be resolved via path traversal if not unique
  // But our schema has unique constraints on slug? No, wait, schema index on slug but not unique constraint in SQL provided in prompt?
  // User request: "CREATE INDEX idx_nodes_slug ON nodes(slug);" - NOT UNIQUE.
  // However, usually slugs are unique for docs.
  // Let's search by slug and collection.

  const collection = await db.query.collections.findFirst({
    where: eq(collections.name, collectionName),
  });

  if (!collection) return null;

  const page = await db.query.nodes.findFirst({
    where: and(
      eq(nodes.collectionId, collection.id),
      eq(nodes.slug, slug),
      eq(nodes.isPublished, true),
    ),
  });

  return page;
}
