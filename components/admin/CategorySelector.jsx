// components/admin/CategorySelector.jsx
export const CategorySelector = ({ category, onChange, theme }) => {
  const cardClasses = `px-3 py-2 rounded-lg border transition-all duration-200 ${
    theme === 'dark' 
      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
  }`;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Category</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("docs")}
          className={`${cardClasses} text-left ${
            category === "docs"
              ? theme === 'dark'
                ? 'ring-2 ring-blue-500 bg-blue-900/20'
                : 'ring-2 ring-blue-500 bg-blue-50'
              : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${category === "docs" ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
            <div>
              <div className="font-medium">📚 Documents</div>
              <div className="text-xs opacity-75 mt-1">
                Create folders and documents (.mdx, .pdf, .docx)
              </div>
            </div>
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => onChange("notes")}
          className={`${cardClasses} text-left ${
            category === "notes"
              ? theme === 'dark'
                ? 'ring-2 ring-green-500 bg-green-900/20'
                : 'ring-2 ring-green-500 bg-green-50'
              : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${category === "notes" ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <div>
              <div className="font-medium">📝 Notes</div>
              <div className="text-xs opacity-75 mt-1">
                Create folders and notes (.mdx, .pdf, .docx)
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};