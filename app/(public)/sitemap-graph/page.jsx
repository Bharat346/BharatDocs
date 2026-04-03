import { getTree } from "@/lib/db/data";
import Link from "next/link";
import { ChevronRight, File, Folder, Book } from "lucide-react";

export const metadata = {
  title: "Sitemap Graph – BH Docs",
  description:
    "Visual navigation map of all computer science notes, PDFs, and documentation on BH Docs.",
};

export default async function SitemapGraph() {
  const docsTree = await getTree("Docs");
  const notesTree = await getTree("Notes");

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 sm:px-12 max-w-7xl mx-auto">
      <header className="mb-12 border-b border-gray-100 dark:border-zinc-800 pb-8">
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4 tracking-tight">
          Sitemap Graph
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">
          Navigate through the entire knowledge base structure visually.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Book className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold dark:text-white">
              Documentation Clusters
            </h2>
          </div>
          <div className="pl-2 border-l-2 border-blue-500/10">
            {docsTree.map((node) => (
              <TreeBranch key={node.id} node={node} basePath="/docs" />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <File className="w-6 h-6 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold dark:text-white">
              Notes & Resources
            </h2>
          </div>
          <div className="pl-2 border-l-2 border-indigo-500/10">
            {notesTree.map((node) => (
              <TreeBranch key={node.id} node={node} basePath="/notes" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function TreeBranch({ node, basePath, path = [], depth = 0 }) {
  const isFolder = node.type === "folder";
  const currentPath = [...path, node.slug];
  const fullPath = currentPath.join("/");

  let url = "";
  if (basePath === "/notes") {
    // Folders go to /notes, Files go to /pdf
    url = isFolder ? `/notes/${fullPath}` : `/pdf/${fullPath}`;
  } else if (basePath === "/docs") {
    // Clusters are at root, children are pages within that cluster
    if (depth === 0) {
      url = `/docs/${node.slug}`;
    } else {
      // Use the root slug as the cluster name and the node's slug as the child query param
      const clusterSlug = path[0] || node.slug;
      url = `/docs/${clusterSlug}?child=${node.slug}`;
    }
  }

  return (
    <div className="mb-3">
      <div className="flex items-center group">
        <div className="flex-shrink-0 mr-2 text-zinc-400">
          {isFolder ? (
            <Folder className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
          )}
        </div>

        {url ? (
          <Link
            href={url}
            className="text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors py-1 inline-flex items-center gap-2"
          >
            <span className={isFolder ? "font-semibold" : ""}>{node.name}</span>
            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800/50 px-2 py-0.5 rounded text-zinc-400 invisible group-hover:visible transition-all">
              {url}
            </span>
          </Link>
        ) : (
          <span className="font-semibold text-zinc-800 dark:text-zinc-200 py-1">
            {node.name}
          </span>
        )}
      </div>

      {node.children && node.children.length > 0 && (
        <div className="ml-5 mt-1 pl-4 border-l border-zinc-100 dark:border-zinc-800/50 space-y-1">
          {node.children.map((child) => (
            <TreeBranch
              key={child.id}
              node={child}
              basePath={basePath}
              path={currentPath}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
