import { openDB } from "idb";

const DB_NAME = "pdf-cache";
const STORE_NAME = "files";
const EXPIRY_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function getCachedPdf(url) {
  const db = await getDB();
  const entry = await db.get(STORE_NAME, url);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > EXPIRY_MS) {
    await db.delete(STORE_NAME, url);
    return null;
  }
  return entry.blob;
}

export async function cachePdf(url, blob) {
    const ric = window.requestIdleCallback ?? ((cb) => setTimeout(cb,200));

    queueMicrotask(() => {
        ric(async () => {
            try{
                const db = await getDB();
                await db.put(STORE_NAME, { blob, timestamp: Date.now() }, url);
            }
            catch(e){
                console.error("Failed to cache PDF:", e);
            }
        })
    })
}
