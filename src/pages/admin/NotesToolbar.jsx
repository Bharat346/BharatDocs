// src/components/NotesManager/NotesToolbar.jsx
import { useState } from 'react';
import AddItemModal from '../Notes/AddItemModal';

const NotesToolbar = ({ 
  currentPath, 
  onNavigateUp, 
  onAddItem, 
  onDeleteItems, 
  onSaveChanges,
  selectedItems,
  isDark,
  isSaving
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState(null);

  const handleAdd = (type) => {
    setModalType(type);
    setShowAddModal(true);
  };

  const handleSubmit = (itemData) => {
    onAddItem({
      ...itemData,
      type: modalType,
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddModal(false);
  };

  const handleSave = async () => {
    if (!isSaving) {
      await onSaveChanges();
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-4 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
      <button
        onClick={onNavigateUp}
        disabled={isSaving}
        className={`px-3 py-1 rounded ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Up
      </button>
      
      <div className="flex-1 truncate">
        {currentPath.join(' / ')}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => handleAdd('Folder')}
          disabled={isSaving}
          className={`px-3 py-1 rounded ${isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-400'} text-white ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Add Folder
        </button>
        <button
          onClick={() => handleAdd('File')}
          disabled={isSaving}
          className={`px-3 py-1 rounded ${isDark ? 'bg-green-600 hover:bg-green-500' : 'bg-green-500 hover:bg-green-400'} text-white ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Add File
        </button>
        <button
          onClick={onDeleteItems}
          disabled={selectedItems.length === 0 || isSaving}
          className={`px-3 py-1 rounded ${selectedItems.length === 0 || isSaving ? 
            isDark ? 'bg-gray-600' : 'bg-gray-300' : 
            isDark ? 'bg-red-600 hover:bg-red-500' : 'bg-red-500 hover:bg-red-400'} text-white`}
        >
          Delete
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-3 py-1 rounded flex items-center justify-center min-w-24 ${
            isDark ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-500 hover:bg-purple-400'
          } text-white ${isSaving ? 'opacity-75 cursor-wait' : ''}`}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
      
      {showAddModal && (
        <AddItemModal
          type={modalType}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmit}
          isDark={isDark}
          isDisabled={isSaving}
        />
      )}
    </div>
  );
};

export default NotesToolbar;