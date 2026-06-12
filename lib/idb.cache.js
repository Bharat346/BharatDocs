import { openDB } from "idb";

const DB_NAME = "bharatdocs-cache-db";
const DB_VERSION = 1;
export const STORES = {
  PDF: "pdf-store",
  DOCS_MDX: "docs-mdx-store",
  BLOGS_MDX: "blogs-mdx-store",
};
const MAX_ITEMS = 7;

// Initialize DB
async function getDB() {
  if (typeof window === "undefined") return null;
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORES.PDF)) {
        db.createObjectStore(STORES.PDF);
      }
      if (!db.objectStoreNames.contains(STORES.DOCS_MDX)) {
        db.createObjectStore(STORES.DOCS_MDX);
      }
      if (!db.objectStoreNames.contains(STORES.BLOGS_MDX)) {
        db.createObjectStore(STORES.BLOGS_MDX);
      }
    },
  });
}

/**
 * Get an item from a specific store
 */
export async function getFromCache(storeName, key) {
  const db = await getDB();
  if (!db) return null;
  
  try {
    const entry = await db.get(storeName, key);
    if (!entry) return null;

    // Update last accessed time for LRU
    entry.lastAccessed = Date.now();
    await db.put(storeName, entry, key);

    return entry.data;
  } catch (error) {
    console.error(`[IDB Cache] Error reading ${key} from ${storeName}:`, error);
    return null;
  }
}

/**
 * Set an item in a specific store with LRU eviction
 */
export async function setToCache(storeName, key, data) {
  const db = await getDB();
  if (!db) return;

  try {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    // Add the new item
    await store.put({ data, lastAccessed: Date.now() }, key);

    // LRU Eviction: Keep only MAX_ITEMS
    const keys = await store.getAllKeys();
    if (keys.length > MAX_ITEMS) {
      const allEntries = await Promise.all(
        keys.map(async (k) => {
          const val = await store.get(k);
          return { key: k, lastAccessed: val.lastAccessed };
        })
      );
      
      // Sort by oldest first
      allEntries.sort((a, b) => a.lastAccessed - b.lastAccessed);
      
      // Delete oldest until we hit MAX_ITEMS
      const excessCount = allEntries.length - MAX_ITEMS;
      for (let i = 0; i < excessCount; i++) {
        await store.delete(allEntries[i].key);
      }
    }

    await tx.done;
  } catch (error) {
    console.error(`[IDB Cache] Error setting ${key} in ${storeName}:`, error);
  }
}
