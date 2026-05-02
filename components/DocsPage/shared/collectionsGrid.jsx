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
        className="rounded-2xl overflow-hidden transition-all duration-300 h-full flex flex-col bg-background border border-border group-hover:border-indigo-500/50 group-hover:shadow-2xl group-hover:shadow-indigo-500/5 group-hover:-translate-y-1"
      >
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all bg-indigo-500/5 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/10"
            >
              <Folder className="h-6 w-6" />
            </div>

            <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <h3
              className="text-xl font-black tracking-tight leading-tight transition-colors text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
            >
              {collection.name}
            </h3>

            <div
              className="flex items-center text-[10px] font-bold uppercase tracking-widest text-neutral-400"
            >
              <Calendar className="h-3 w-3 mr-1.5" />
              Updated {formatDate(collection.updatedAt)}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-border/50 flex flex-wrap items-center gap-2">
            {collection.fileType && (
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
              >
                {collection.fileType}
              </span>
            )}
            {collection.tags &&
              collection.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-[0.15em] bg-secondary-bg border border-border text-neutral-500 dark:text-neutral-400 group-hover:border-indigo-500/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                >
                  {tag}
                </span>
              ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
