"use client";

import { useState, useEffect } from "react";

export function useSearch(initialQuery = "") {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchResults = async (q = "") => {
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.error(e);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getLink = (node) => {
    const coll = node.collectionName?.toLowerCase() || "docs";
    const isFolder = node.nodeType === "folder";
    const isPdf = node.fileType === "pdf" || node.nodeType === "note";

    // ✅ Blog Logic: Open the blog viewer
    if (coll === "blogs" || node.nodeType === "blog") {
      return `/blogs/${node.slug}`;
    }

    // ✅ Folder Logic: Open the folder view
    if (isFolder) {
      if (coll === "notes") return `/pdf/${node.slug}`;
      return `/docs/${node.slug}`;
    }

    // ✅ PDF Logic: Open the viewer directly
    if (isPdf) {
      if (coll === "notes") {
        const parent = node.parentSlug || "";
        return `/pdf/${parent}/${encodeURIComponent(node.slug || node.name)}`;
      }
      // For Docs collection, if it's a child PDF, open in that context
      if (node.parentSlug) {
        return `/docs/${node.parentSlug}?child=${node.slug}`;
      }
      return `/docs/${node.slug}`;
    }

    // Default Fallback
    if (coll === "notes") return `/pdf/${node.slug}`;
    return `/docs/${node.slug}`;
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    getLink,
  };
}
