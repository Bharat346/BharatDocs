// app/(public)/docs/components/LoadingState.jsx
export default function LoadingState({ theme }) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${
      theme === "dark" ? "bg-zinc-950" : "bg-gray-50"
    }`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
          style={{ borderColor: theme === "dark" ? "#3b82f6" : "#1d4ed8" }}
        />
        <p className={`${theme === "dark" ? "text-zinc-400" : "text-gray-600"}`}>
          Loading documents...
        </p>
      </div>
    </div>
  );
}