// app/(public)/docs/components/CollectionsGrid.jsx
import { useRouter } from "next/navigation";
import { Folder, ChevronRight, Calendar } from "lucide-react";

export default function CollectionsGrid({ theme, collections, onCollectionClick }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((col) => (
        <CollectionCard 
          key={col.id} 
          theme={theme} 
          collection={col} 
          onClick={() => onCollectionClick(col)}
        />
      ))}
    </div>
  );
}

function CollectionCard({ theme, collection, onClick }) {
  // Format the date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div 
      onClick={onClick}
      className={`rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group ${
        theme === "dark"
          ? "bg-zinc-900/70 border border-zinc-800 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10"
          : "bg-white/70 border border-gray-200 hover:border-blue-400 hover:shadow-xl"
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${
            theme === "dark" 
              ? "bg-blue-500/20 group-hover:bg-blue-500/30" 
              : "bg-blue-100 group-hover:bg-blue-200"
          } transition-colors duration-300`}>
            <Folder className={`h-7 w-7 ${
              theme === "dark" ? "text-blue-400" : "text-blue-500"
            }`} />
          </div>
          
          <ChevronRight className={`h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 ${
            theme === "dark" ? "text-zinc-600 group-hover:text-blue-400" : "text-gray-400 group-hover:text-blue-500"
          }`} />
        </div>
        
        <h3 className={`text-xl font-semibold mb-2 group-hover:text-blue-500 transition-colors duration-300 ${
          theme === "dark" ? "text-zinc-100" : "text-gray-900"
        }`}>
          {collection.name}
        </h3>
        
        {collection.description && (
          <p className={`text-sm mb-4 line-clamp-2 ${
            theme === "dark" ? "text-zinc-400" : "text-gray-600"
          }`}>
            {collection.description}
          </p>
        )}
        
        <div className={`flex items-center text-sm ${
          theme === "dark" ? "text-zinc-500" : "text-gray-500"
        }`}>
          <Calendar className="h-4 w-4 mr-2" />
          Updated {formatDate(collection.updatedAt)}
        </div>
        
        {/* Optional: Show document type badge */}
        {collection.fileType && (
          <div className="mt-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              theme === "dark" 
                ? "bg-zinc-800 text-zinc-300" 
                : "bg-gray-100 text-gray-700"
            }`}>
              {collection.fileType.toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}