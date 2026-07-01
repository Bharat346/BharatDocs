import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { docs, notes, blogs } from "@/lib/db/schema";
import { eq, and, ilike, or } from "drizzle-orm";
import { cached } from "@/lib/cache/lru";
import { getCachedAllDocs } from "@/lib/db/queries/docs";
import { getCachedAllNotes } from "@/lib/db/queries/notes";
import { getCachedPublishedBlogs } from "@/lib/db/queries/blogs";
import Fuse from "fuse.js";

function buildFullPath(nodeId, allNodesMap) {
  let path = [];
  let current = allNodesMap.get(nodeId);
  while (current) {
    path.unshift(current.slug);
    current = current.parentId ? allNodesMap.get(current.parentId) : null;
  }
  return path.join("/");
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters", code: "INVALID_QUERY" },
        { status: 400 },
      );
    }

    // Sanitize and limit
    const query = q.slice(0, 100);
    const pattern = `%${query}%`;

    const results = await cached("search", query, async () => {
      const [allDocs, allNotes, allBlogs] = await Promise.all([
        getCachedAllDocs(),
        getCachedAllNotes(),
        getCachedPublishedBlogs({ limit: 1000 })
      ]);

      const fuseOptions = {
        keys: ['name', 'title', 'description'],
        threshold: 0.4,
        ignoreLocation: true,
      };

      const docsFuse = new Fuse(allDocs.filter(d => d.type === "document"), fuseOptions);
      const notesFuse = new Fuse(allNotes.filter(n => n.type === "document"), fuseOptions);
      const blogsFuse = new Fuse(allBlogs, fuseOptions);

      const docResults = docsFuse.search(query).map(r => r.item).slice(0, 10);
      const noteResults = notesFuse.search(query).map(r => r.item).slice(0, 10);
      const blogResults = blogsFuse.search(query).map(r => r.item).slice(0, 10);

      const docsMap = new Map(allDocs.map(d => [d.id, d]));
      const notesMap = new Map(allNotes.map(n => [n.id, n]));

      return {
        docs: docResults.map((d) => ({ 
          ...d, 
          category: "docs",
          slug: buildFullPath(d.id, docsMap)
        })),
        notes: noteResults.map((n) => ({ 
          ...n, 
          category: "notes",
          slug: buildFullPath(n.id, notesMap)
        })),
        blogs: blogResults.map((b) => ({
          id: b.id,
          name: b.title,
          slug: b.slug,
          description: b.description,
          category: "blogs",
        })),
      };
    });

    // No HTTP cache for search
    const res = NextResponse.json(results);
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error) {
    console.error("GET /api/search:", error);
    return NextResponse.json(
      { error: "Search failed", code: "SEARCH_ERROR" },
      { status: 500 },
    );
  }
}
