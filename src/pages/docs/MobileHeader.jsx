export const MobileHeader = ({ title }) => {
    return (
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm p-4 z-20 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1 flex-1 text-center px-2">
          {title}
        </h1>
      </div>
    );
  };