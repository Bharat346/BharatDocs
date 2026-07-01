"use client";

import { usePathname } from "next/navigation";
import DocSidebar from "./DocSidebar";
import { useMemo } from "react";

export default function DocSidebarWrapper({ allDocs }) {
  const pathname = usePathname();
  
  const sidebarDocs = useMemo(() => {
    // pathname is like /docs/folder/subfolder/doc
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length < 2) return []; // just /docs

    const currentSlug = segments[segments.length - 1];
    let currentNode = allDocs.find(d => d.slug === currentSlug);
    if (!currentNode) return [];

    // Walk up to find root
    while (currentNode.parentId) {
      const parent = allDocs.find(d => d.id === currentNode.parentId);
      if (!parent) break;
      currentNode = parent;
    }

    const rootId = currentNode.id;

    // Find all descendants of rootId
    const descendants = [currentNode];
    const findDescendants = (parentId) => {
      const children = allDocs.filter(d => d.parentId === parentId);
      descendants.push(...children);
      children.forEach(c => findDescendants(c.id));
    };

    findDescendants(rootId);
    
    // Sort descendants by orderIndex
    descendants.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    return descendants;
  }, [pathname, allDocs]);

  if (sidebarDocs.length === 0) return null;

  return <DocSidebar docs={sidebarDocs} />;
}
