const MainFolderSelector = ({ folders, onSelect, isDark }) => {
    return (
      <div
        className={`p-4 sm:p-6 mt-20 ${
          isDark ? "bg-transparent-900" : "bg-transparent-900"
        }`}
      >
        <h2
          className={`text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 ${
            isDark ? "text-white" : "text-gray-800"
          }`}
        >
          📁 Select a Folder
        </h2>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <div
              key={folder}
              onClick={() => onSelect(folder)}
              className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 ease-in-out
                shadow-md hover:shadow-xl
                ${
                  isDark
                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                    : "bg-[#e0f7ff] hover:bg-[#b3ecff] text-[#003344] border border-[#00BDFC]/40"
                }
                hover:scale-[1.03] active:scale-[0.97]
              `}
              
            >
              <svg
                className={`w-6 h-6 mr-3 shrink-0 ${
                  isDark ? "text-yellow-400" : "text-yellow-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              <span className="text-base sm:text-lg font-medium truncate">{folder}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default MainFolderSelector;
  