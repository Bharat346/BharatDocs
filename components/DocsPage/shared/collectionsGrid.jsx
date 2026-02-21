import Link from "next/link";
import { Folder, ChevronRight, Calendar } from "lucide-react";
import { shouldPrefetch } from "@/lib/network/network.config";

export default function CollectionsGrid({ theme, collections }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
      {collections.map((col) => (
        <CollectionCard key={col.id} theme={theme} collection={col} />
      ))}
    </div>
  );
}

function CollectionCard({ theme, collection }) {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <Link
      href={`/docs/${collection.slug}`}
      prefetch={shouldPrefetch()}
      className="group block focus:outline-none"
    >
      <article
        className={`rounded-2xl overflow-hidden transition-all duration-300 ${
          theme === "dark"
            ? "bg-zinc-900/70 border border-zinc-800 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10"
            : "bg-white/70 border border-gray-200 hover:border-blue-400 hover:shadow-xl"
        }`}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div
              className={`p-3 rounded-xl transition-colors ${
                theme === "dark"
                  ? "bg-blue-500/20 group-hover:bg-blue-500/30"
                  : "bg-blue-100 group-hover:bg-blue-200"
              }`}
            >
              <Folder
                className={`h-7 w-7 ${
                  theme === "dark" ? "text-blue-400" : "text-blue-500"
                }`}
              />
            </div>

            <ChevronRight
              className={`h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 ${
                theme === "dark"
                  ? "text-zinc-600 group-hover:text-blue-400"
                  : "text-gray-400 group-hover:text-blue-500"
              }`}
            />
          </div>

          <h3
            className={`text-xl font-semibold mb-2 transition-colors ${
              theme === "dark"
                ? "text-zinc-100 group-hover:text-blue-400"
                : "text-gray-900 group-hover:text-blue-500"
            }`}
          >
            {collection.name}
          </h3>

          <div
            className={`flex items-center text-sm ${
              theme === "dark" ? "text-zinc-500" : "text-gray-500"
            }`}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Updated {formatDate(collection.updatedAt)}
          </div>

          {collection.fileType && (
            <div className="mt-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  theme === "dark"
                    ? "bg-zinc-800 text-zinc-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {collection.fileType.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
