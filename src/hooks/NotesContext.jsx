// src/context/NotesContext.jsx
import { createContext, useContext, useState } from "react";

const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
  const [currentPath, setCurrentPath] = useState([]);
  const [cachedFolders, setCachedFolders] = useState({});

  const navigateToFolder = (folderPath) => {
    setCurrentPath(folderPath);
  };

  const cacheFolderData = (path, data) => {
    setCachedFolders(prev => ({
      ...prev,
      [path.join('/')]: data
    }));
  };

  const getCachedFolderData = (path) => {
    return cachedFolders[path.join('/')];
  };

  return (
    <NotesContext.Provider 
      value={{ 
        currentPath, 
        navigateToFolder,
        cacheFolderData,
        getCachedFolderData
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};