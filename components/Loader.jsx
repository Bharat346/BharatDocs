export default function Loader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="relative">
        <div className="h-20 w-20 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-t-transparent" />
        </div>
        <div className="mt-8 text-center">
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 font-montserrat">
            Bharat Docs
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Loading premium experience...
          </div>
          <div className="text-xs text-blue-500 mt-1">v2.1.0</div>
        </div>
      </div>
    </div>
  );
}