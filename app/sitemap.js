import { getTree } from "@/lib/db/data";

export default async function sitemap() {
  const baseUrl = "https://bhdocs.in";

  try {
    const sitemapEntries = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${baseUrl}/docs`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/notes`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
    ];

    const docsTree = await getTree("Docs");
    const notesTree = await getTree("Notes");

    function traverse(nodes, basePath, path = [], depth = 0) {
      nodes.forEach((node) => {
        if (!node.slug) return;

        const currentPath = [...path, node.slug];
        const fullPath = currentPath.join("/");
        let url = "";

        if (basePath === "/notes") {
          // Folders to /notes, Files to /pdf
          url = node.type === "folder" ? `/notes/${fullPath}` : `/pdf/${fullPath}`;
        } else if (basePath === "/docs") {
          // depth 0: /docs/cluster, depth > 0: /docs/cluster?child=page
          if (depth === 0) {
            url = `/docs/${node.slug}`;
          } else {
            url = `/docs/${path[0]}?child=${node.slug}`;
          }
        }

        if (url) {
          sitemapEntries.push({
            url: `${baseUrl}${url}`,
            lastModified: node.updatedAt || new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
          });
        }

        if (node.children && node.children.length > 0) {
          traverse(node.children, basePath, currentPath, depth + 1);
        }
      });
    }

    traverse(docsTree, "/docs");
    traverse(notesTree, "/notes");

    return sitemapEntries;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      },
    ];
  }
}
