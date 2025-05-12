// src/components/NotesManager/NotesManager.jsx
import { useState, useEffect } from 'react';
import { useDark } from '@/hooks/darkmode.jsx';
import { fetchMainFolders, fetchNotesData, updateNotesData } from '@/api/notesApi.js';
import NotesBrowser from '../Notes/NotesBrowser';
import NotesToolbar from './NotesToolbar';
import MainFolderSelector from '../Notes/MainFolderSelector';
import { validateNoteItem } from '../Notes/notesUtils';
import toast from 'react-hot-toast';

const NotesManager = () => {
  const { isDark } = useDark();
  const [mainFolders, setMainFolders] = useState([]);
  const [selectedMainFolder, setSelectedMainFolder] = useState(null);
  const [notesData, setNotesData] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  // Load main folders on initial render
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const folders = await fetchMainFolders();
        setMainFolders(folders);
        setError(null);
      } catch (err) {
        setError(err.message);
        toast.error(`Failed to load folders: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Load folder data when selectedMainFolder changes
  useEffect(() => {
    if (!selectedMainFolder) return;
    
    const loadFolderData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchNotesData(selectedMainFolder);
        
        setNotesData(data);
        setCurrentPath([selectedMainFolder]);
        setError(null);
        toast.success(`Loaded ${selectedMainFolder} folder`);
      } catch (err) {
        setError(err.message);
        toast.error(`Failed to load folder: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadFolderData();
  }, [selectedMainFolder]);

  const getCurrentFolder = () => {
    if (!notesData) return null;
    
    let currentFolder = notesData;
    for (const folderName of currentPath.slice(1)) {
      currentFolder = currentFolder.subfolders?.[folderName];
      if (!currentFolder) return null;
    }
    return currentFolder;
  };

  const addItem = async (item) => {
    if (!validateNoteItem(item)) {
      toast.error('Invalid item data');
      throw new Error('Invalid item data');
    }
  
    try {
      // Create a deep copy of notesData to avoid direct state mutation
      const updatedNotesData = JSON.parse(JSON.stringify(notesData));
      
      // Navigate to the current folder in the copied data
      let currentFolder = updatedNotesData;
      for (const folderName of currentPath.slice(1)) {
        currentFolder = currentFolder.subfolders?.[folderName];
        if (!currentFolder) {
          toast.error('Folder not found');
          throw new Error('Folder not found');
        }
      }
  
      if (item.type === 'Folder') {
        // Initialize subfolders if they don't exist
        currentFolder.subfolders = currentFolder.subfolders || {};
        // Add parent reference
        item.parent = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;
        // Add the new folder
        currentFolder.subfolders[item.baseName] = item;
      } else {
        // Initialize children if they don't exist
        currentFolder.children = currentFolder.children || [];
        // Add the new file
        currentFolder.children.push(item);
      }
  
      // Update the state with the new data
      setNotesData(updatedNotesData);
      toast.success(`${item.type} added successfully`);
    } catch (err) {
      toast.error(`Failed to add item: ${err.message}`);
      throw err;
    }
  };

  const deleteItems = async (items) => {
    const currentFolder = getCurrentFolder();
    if (!currentFolder) {
      toast.error('Folder not found');
      throw new Error('Folder not found');
    }

    try {
      items.forEach(item => {
        if (item.type === 'Folder') {
          delete currentFolder.subfolders?.[item.baseName];
        } else {
          currentFolder.children = currentFolder.children?.filter(
            child => child.name !== item.name
          ) || [];
        }
      });

      setNotesData({...notesData});
      setSelectedItems([]);
      toast.success(`Deleted ${items.length} item(s)`);
    } catch (err) {
      toast.error(`Failed to delete items: ${err.message}`);
      throw err;
    }
  };

  const navigateToFolder = (folderName) => {
    setCurrentPath([...currentPath, folderName]);
  };

  const navigateUp = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const currentFolder = getCurrentFolder();
      console.log(currentPath);
      
      if (!currentFolder) {
        throw new Error('No folder selected');
      }

      const fullPath = [...currentPath][0];
      console.log(fullPath , notesData);
      
      await updateNotesData(fullPath, notesData);
      toast.success('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error(`Failed to save changes: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToMain = () => {
    setSelectedMainFolder(null);
    setNotesData(null);
    setCurrentPath([]);
    setSelectedItems([]);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDark ? 'text-white' : 'text-black'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-100 text-red-700'}`}>
        <h3 className="font-bold">Error Loading Data</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={`mt-2 px-4 py-2 rounded ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!selectedMainFolder) {
    return <MainFolderSelector folders={mainFolders} onSelect={setSelectedMainFolder} isDark={isDark} />;
  }

  return (
    <>
      <div className="space-y-4 mt-17">
      <div className={`sticky top-0 z-10 p-4 ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-md`}>
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToMain}
            className={`flex items-center px-4 py-2 rounded-lg ${
              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            } transition-colors`}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Folders
          </button>
          
          <div className={`px-4 py-2 rounded-lg ${
            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
          }`}>
            {currentPath.join(' / ')}
          </div>
        </div>
      </div>

      <div className="px-4">
        <NotesToolbar
          currentPath={currentPath}
          onNavigateUp={navigateUp}
          onAddItem={addItem}
          onDeleteItems={() => deleteItems(selectedItems)}
          onSaveChanges={handleSaveChanges}
          selectedItems={selectedItems}
          isDark={isDark}
          isSaving={isSaving}
        />

        {isSaving && (
          <div className={`my-4 p-3 rounded-lg ${
            isDark ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-100 text-blue-700'
          }`}>
            Saving changes...
          </div>
        )}

        <NotesBrowser
          folder={getCurrentFolder()}
          onFolderClick={navigateToFolder}
          selectedItems={selectedItems}
          onSelectItems={setSelectedItems}
          isDark={isDark}
          currentPath={currentPath}
        />
      </div>
    </div>
    </>
  );
};

export default NotesManager;