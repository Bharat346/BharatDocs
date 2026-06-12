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
      className="group block focus:outline-none"
    >
      <article
        className="rounded-xl transition-all duration-200 flex items-center gap-4 p-4 bg-background border border-border group-hover:border-primary/40 group-hover:bg-primary/[0.02]"
      >
        <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-colors bg-secondary-bg group-hover:bg-primary group-hover:text-primary-foreground text-neutral-500 dark:text-neutral-400">
          <Folder className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate transition-colors text-foreground group-hover:text-primary">
            {collection.name}
          </h3>
          <div className="flex items-center text-xs text-neutral-500 mt-0.5">
            Updated {formatDate(collection.updatedAt)}
          </div>
        </div>

        <div className="text-neutral-300 dark:text-neutral-600 group-hover:text-primary transition-colors">
          <ChevronRight className="h-4 w-4" />
        </div>
      </article>
    </Link>
  );
}
