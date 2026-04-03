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
      prefetch={true}
      className="group block h-full focus:outline-none"
    >
      <article
        className={`rounded-2xl overflow-hidden transition-all duration-300 h-full flex flex-col ${
          theme === "dark"
            ? "bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10"
            : "bg-white border border-gray-200 hover:border-indigo-400 hover:shadow-xl"
        }`}
      >
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div
              className={`p-3 rounded-xl transition-colors ${
                theme === "dark"
                  ? "bg-indigo-500/20 group-hover:bg-indigo-500/30"
                  : "bg-indigo-100 group-hover:bg-indigo-200"
              }`}
            >
              <Folder
                className={`h-7 w-7 ${
                  theme === "dark" ? "text-indigo-400" : "text-indigo-500"
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
            className={`text-[clamp(1.125rem,4vw,1.25rem)] font-semibold mb-2 truncate transition-colors ${
              theme === "dark"
                ? "text-zinc-100 group-hover:text-indigo-400"
                : "text-gray-900 group-hover:text-indigo-500"
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

          <div className="mt-auto pt-6 flex flex-wrap gap-2">
            {collection.fileType && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  theme === "dark"
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                }`}
              >
                {collection.fileType}
              </span>
            )}
            {collection.tags &&
              collection.tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    theme === "dark"
                      ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
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
