// Helper: non-blocking JSON fetch
async function fetchJson(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);

  const text = await res.text();
  return new Promise((resolve, reject) => {
    queueMicrotask(() => {
      try {
        const json = JSON.parse(text);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Fetch notes for a given collection and optional parent slug
 * @param {string} collectionName
 * @param {string} [parentSlug]
 * @param {AbortSignal} [signal]
 */
export async function fetchNotes(collectionName, parentSlug, signal) {
  if (!collectionName) return [];
  const apiUrl = `/api/notes?collection=${collectionName}${
    parentSlug ? `&parentSlug=${parentSlug}` : ""
  }`;
  return await fetchJson(apiUrl, signal);
}

