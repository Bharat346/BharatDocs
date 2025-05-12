// src/pages/NotesView.jsx
import { useState, useEffect, useContext } from "react";
import { useDark } from "@/hooks/darkmode.jsx";
import { fetchMainFolders, fetchNotesData } from "@/api/notesApi.js";
import toast from "react-hot-toast";
import {
  Folder,
  File,
  ChevronRight,
  FileText,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import { useNavigate, useLocation } from "react-router-dom";
import OfflinePage from "../offline";
import { useNotes } from "@/hooks/NotesContext";
import { cache } from "@/lib/cacheManager.js";

const NotesView = () => {
  const navigate = useNavigate();
  const { isDark } = useDark();
  const [mainFolders, setMainFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const location = useLocation();
  const {
    currentPath,
    navigateToFolder,
    cacheFolderData,
    getCachedFolderData,
  } = useNotes();

  // Cache keys
  const MAIN_FOLDERS_CACHE_KEY = "notes_main_folders";
  const FOLDER_DATA_CACHE_KEY = (path) => `notes_data_${path.join("/")}`;

  // Load main folders on mount
  useEffect(() => {
    const loadFolders = async () => {
      try {
        setIsLoading(true);

        // Check online status first
        if (!navigator.onLine) {
          setIsOffline(true);
          const cached = cache.get(MAIN_FOLDERS_CACHE_KEY);
          if (cached) setMainFolders(cached);
          return;
        }

        // Try cache first
        const cachedFolders = cache.get(MAIN_FOLDERS_CACHE_KEY);
        if (cachedFolders) {
          setMainFolders(cachedFolders);
        }

        const folders = await fetchMainFolders();
        setMainFolders(folders);
        cache.set(MAIN_FOLDERS_CACHE_KEY, folders, { ttl: 60 * 60 * 1000 }); // 1 hour cache
        setIsOffline(false);
      } catch (error) {
        console.error("Failed to load folders:", error);
        if (!navigator.onLine) {
          setIsOffline(true);
          const cached = cache.get(MAIN_FOLDERS_CACHE_KEY);
          if (cached) setMainFolders(cached);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadFolders();

    // Add event listeners for online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load folder data when path changes
  useEffect(() => {
    if (currentPath.length === 0) {
      setCurrentFolder(null);
      return;
    }

    const loadFolderData = async () => {
      try {
        setIsLoading(true);
        const rootFolderName = currentPath[0];
        const cacheKey = FOLDER_DATA_CACHE_KEY(currentPath);

        // Check context cache first
        const contextCached = getCachedFolderData(currentPath);
        if (contextCached) {
          setCurrentFolder(contextCached);
          return;
        }

        // Check persistent cache
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
          setCurrentFolder(cachedData);
          cacheFolderData(currentPath, cachedData);
          return;
        }

        // Fetch fresh data
        const data = await fetchNotesData(rootFolderName);

        // Navigate through subfolders manually
        let current = data;
        for (let i = 1; i < currentPath.length; i++) {
          const folderName = currentPath[i];
          if (current.subfolders && current.subfolders[folderName]) {
            current = current.subfolders[folderName];
          } else {
            throw new Error(`Folder '${folderName}' not found`);
          }
        }

        setCurrentFolder(current);
        cacheFolderData(currentPath, current);
        cache.set(cacheKey, current, { ttl: 60 * 60 * 1000 }); // 1 hour cache
      } catch (error) {
        console.error("Failed to load folder:", error);
        toast.error(`Failed to load folder: ${error.message}`);
        navigateToFolder(currentPath.slice(0, -1)); // Rollback
      } finally {
        setIsLoading(false);
      }
    };

    loadFolderData();
  }, [currentPath]);

  const navigateToSubfolder = (folderName) => {
    const newPath = [...currentPath, folderName];
    navigateToFolder(newPath);
    navigate(`/notes/view?s=${newPath.join("/")}`);
  };

  const navigateUp = () => {
    if (currentPath.length === 0) return;
    const newPath = currentPath.slice(0, -1);
    navigateToFolder(newPath);
    navigate(`/notes/view?s=${newPath.join("/")}`);
  };

  const navigateToPathIndex = (index) => {
    const newPath = currentPath.slice(0, index + 1);
    navigateToFolder(newPath);
    navigate(`/notes/view?s=${newPath.join("/")}`);
  };

  const getFileIcon = (format) => {
    switch (format) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "xlsx":
        return <FileText className="w-5 h-5 text-green-500" />;
      case "pptx":
        return <FileText className="w-5 h-5 text-orange-500" />;
      default:
        return <File className="w-5 h-5 text-blue-500" />;
    }
  };

  // Initialize path from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pathParam = params.get("s");
    if (pathParam === "") navigateToFolder([]);
    if (pathParam) {
      const pathArray = pathParam.split("/").filter(Boolean);
      navigateToFolder(pathArray);
    }
  }, [location.search]);

  if (isLoading) {
    return (
      <div
        className={`min-h-screen mt-17 ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        } flex items-center justify-center`}
      >
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  if (isOffline && mainFolders.length === 0) {
    return <OfflinePage />;
  }

  return (
    <div
      className={`min-h-screen mt-17 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      } flex justify-center`}
    >
      <div className="w-full md:w-1/2 h-full px-4">
        {/* Path Navigation */}
        <div className="mb-4 pt-4">
          <div
            className={`flex items-center text-lg font-medium ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            <span
              className="hover:underline cursor-pointer"
              onClick={() => {
                navigateToFolder([]);
                navigate("/notes/view");
              }}
            >
              Notes
            </span>

            {currentPath.length > 0 && (
              <>
                <ChevronRight className="mx-2 w-4 h-4" />

                {currentPath.length > 4 ? (
                  <>
                    {/* First folder */}
                    <div className="flex items-center">
                      <span
                        className="hover:underline cursor-pointer"
                        onClick={() => navigateToPathIndex(0)}
                      >
                        {currentPath[0]}
                      </span>
                      <ChevronRight className="mx-2 w-4 h-4" />
                    </div>

                    {/* Ellipsis */}
                    <div className="flex items-center">
                      <span className="mx-1 text-gray-400">...</span>
                      <ChevronRight className="mx-2 w-4 h-4" />
                    </div>

                    {/* Last 2 folders */}
                    {currentPath.slice(-2).map((folder, index) => {
                      const actualIndex = currentPath.length - 2 + index;
                      return (
                        <div key={actualIndex} className="flex items-center">
                          <span
                            className="hover:underline cursor-pointer"
                            onClick={() => navigateToPathIndex(actualIndex)}
                          >
                            {folder}
                          </span>
                          {actualIndex < currentPath.length - 1 && (
                            <ChevronRight className="mx-2 w-4 h-4" />
                          )}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  currentPath.map((folder, index) => (
                    <div key={index} className="flex items-center">
                      <span
                        className="hover:underline cursor-pointer"
                        onClick={() => navigateToPathIndex(index)}
                      >
                        {folder}
                      </span>
                      {index < currentPath.length - 1 && (
                        <ChevronRight className="mx-2 w-4 h-4" />
                      )}
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div
          className={`mb-6 p-4 rounded-lg ${
            isDark
              ? "bg-blue-900/20 border border-blue-800"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          <div className="flex items-start">
            <AlertCircle
              className={`flex-shrink-0 h-5 w-5 mt-0.5 mr-3 ${
                isDark ? "text-blue-300" : "text-blue-600"
              }`}
            />
            <div
              className={`text-sm ${
                isDark ? "text-blue-200" : "text-blue-700"
              }`}
            >
              <p>
                Browse and organize your study materials. Supported formats:
                PDF, XLSX, PPTX.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="h-full pb-8">
          {currentPath.length === 0 ? (
            // Main folders view
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mainFolders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => {
                    navigateToFolder([folder]);
                    console.log(folder);
                    navigate(`/notes/view?s=${folder}`);
                  }}
                  className={`flex items-center p-4 rounded-lg transition-all ${
                    isDark
                      ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
                      : "bg-white hover:bg-gray-50 border-gray-200"
                  } border shadow-sm hover:shadow-md`}
                >
                  <Folder className="w-6 h-6 mr-3 text-yellow-500" />
                  <span className="font-medium text-left">{folder}</span>
                </button>
              ))}
            </div>
          ) : (
            // Folder contents view
            <div className="space-y-4 h-full">
              <div className="flex justify-between items-center">
                <h2
                  className={`text-xl font-semibold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {currentFolder?.title || "Contents"}
                </h2>
                <button
                  onClick={navigateUp}
                  className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-100 hover:bg-gray-200"
                  } transition-colors`}
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </button>
              </div>

              {Object.values(currentFolder?.subfolders || {}).length === 0 &&
              (currentFolder?.children || []).length === 0 ? (
                <div
                  className={`p-8 text-center rounded-lg ${
                    isDark
                      ? "bg-gray-800 text-gray-400"
                      : "bg-gray-50 text-gray-500"
                  }`}
                >
                  This folder is empty
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(currentFolder?.subfolders || {}).map(
                    ([name, subfolder]) => (
                      <div
                        key={name}
                        onClick={() => navigateToSubfolder(name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                          isDark
                            ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
                            : "bg-white hover:bg-gray-50 border-gray-200"
                        } border shadow-sm hover:shadow-md`}
                      >
                        <Folder className="w-6 h-6 mr-3 text-yellow-500" />
                        <div className="flex-1 cursor-pointer">
                          <div className="font-medium">{subfolder.title}</div>
                          <div
                            className={`text-xs ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Updated: {formatDate(subfolder.date)}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    )
                  )}

                  {(currentFolder?.children || []).map((file) => (
                    <div
                      key={file.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(file.url, "_blank", "noopener,noreferrer");
                      }}
                      className={`flex items-center p-4 rounded-lg transition-all cursor-pointer ${
                        isDark
                          ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
                          : "bg-white hover:bg-gray-50 border-gray-200"
                      } border shadow-sm hover:shadow-md`}
                    >
                      {getFileIcon(file.format)}
                      <div className="flex-1 ml-3">
                        <div className="font-medium truncate">{file.name}</div>
                        <div
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Updated: {formatDate(file.date)}
                        </div>
                      </div>
                      <a className="text-blue-500 hover:text-blue-600">
                        <ChevronRight className="w-5 h-5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesView;
