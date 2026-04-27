import Link from "next/link";
import { Folder, ChevronRight, Calendar } from "lucide-react";
import { shouldPrefetch } from "@/lib/network/network.config";

export default function CollectionsGrid({ collections }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
      {collections.map((col) => (
        <CollectionCard key={col.id} collection={col} />
      ))}
    </div>
  );
}

function CollectionCard({ collection }) {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <Link
      href={`/docs/${collection.slug}`}
      prefetch={true}
      className="group block h-full focus:outline-none"
    >
      <article
        className="rounded-xl overflow-hidden transition-all duration-300 h-full flex flex-col bg-background border border-border hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:bg-indigo-500/[0.02]"
      >
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div
              className="p-2.5 rounded-lg transition-colors bg-indigo-500/5 group-hover:bg-indigo-500/15 dark:bg-indigo-500/10 dark:group-hover:bg-indigo-500/20"
            >
              <Folder className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>

            <ChevronRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 text-neutral-400 group-hover:text-indigo-500"
            />
          </div>

          <h3
            className="text-lg font-bold mb-1 truncate transition-colors text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
          >
            {collection.name}
          </h3>

          <div
            className="flex items-center text-[13px] text-gray-400 dark:text-zinc-500"
          >
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Updated {formatDate(collection.updatedAt)}
          </div>

          <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-1.5">
            {collection.fileType && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20"
              >
                {collection.fileType}
              </span>
            )}
            {collection.tags &&
              collection.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-secondary-bg text-neutral-500 border border-border dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            {collection.tags && collection.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                +{collection.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
