// lib/docs.api.js


async function fetchJson(url,signal){
    const res = await fetch(url,{signal});
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);

    const text = await res.text();
    return new Promise((resolve , reject) => {
        queueMicrotask(() => {
            try {
                const json = JSON.parse(text);
                resolve(json);
            } catch (error) {
                reject(error);
            }
        })
    })
}

/**
 * Fetch children docs for a given parent slug
 * @param {string} slug
 * @param {AbortSignal} [signal]
 */
// export async function fetchChildren(slug, signal) {
//   if (!slug) return [];
//   return await fetchJson(`/api/docs?parentSlug=${slug}`, signal);
// }

/**
 * Fetch MDX content for a given filePath
 * @param {string} filePath
 * @param {AbortSignal} [signal]
 */
// export async function fetchMdxContent(filePath, signal) {
//   if (!filePath) return null;
//   const url = `/api/github/content?url=${encodeURIComponent(filePath)}`;
//   return await fetchJson(url, signal);
// }

export async function fetchDocs(signal) {
    const url = `/api/docs?collection=Docs&parentSlug=`;
    return await fetchJson(url, signal);
}
