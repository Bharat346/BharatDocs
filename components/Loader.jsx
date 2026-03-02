export default function Loader() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
      <div className="relative">
        <div className="h-20 w-20 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-t-transparent" />
        </div>
        <div className="mt-8 text-center">
          <div className="text-[clamp(1.125rem,4vw,1.375rem)] font-bold text-gray-800 dark:text-gray-100">
            Bharat Docs
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Loading...
          </div>
          <div className="text-xs text-blue-500 mt-1">v2.1.0</div>
        </div>
      </div>
    </div>
  );
}
