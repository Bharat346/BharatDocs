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
    if (coll === "notes") {
      let baseUrl = `/pdf/${node.parentSlug || ""}`;
      if (node.fileType === "pdf") {
        const cleanPdfParam = node.slug || node.name;
        return `${baseUrl}/${encodeURIComponent(cleanPdfParam)}`;
      }
      return baseUrl;
    } else {
      if (!node.parentSlug) {
        return `/docs/${node.slug}`;
      }
      return `/docs/${node.parentSlug}?child=${node.slug}`;
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    getLink,
  };
}
