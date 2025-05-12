import { useState } from 'react';
import { createOrUpdateFile } from '@/api/github';
import { useDark } from '@/hooks/darkmode.jsx';

const NotesFolderForm = () => {
  const { isDark } = useDark();
  const [formData, setFormData] = useState({
    title: '',
    baseName: '',
    type: 'Folder',
    date: new Date().toISOString().split('T')[0],
    parent: 'Notes',
    children: [],
    subfolders: {},
    subFiles : {}
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const path = `${formData.parent}/${formData.baseName}`;
      const content = JSON.stringify({
        type: formData.type,
        title: formData.title,
        date: formData.date,
        baseName : formData.baseName,
        parent:formData.parent,
        children: formData.children,
        subfolders: formData.subfolders,
        subFiles : formData.subFiles
      }, null, 2);

      await createOrUpdateFile(
        `${path}/index.json`,
        content,
        `Added folder: ${formData.title}`
      );

      setSuccessMessage(`Successfully created folder: ${formData.title}`);
      setTimeout(resetForm, 2000);
    } catch (error) {
      console.error('Error creating folder:', error);
      setErrorMessage(`Failed to create folder: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      baseName: '',
      type: 'Folder',
      date: new Date().toISOString().split('T')[0],
      parent: 'Notes',
      children: [],
      subfolders: {},
    });
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <br /><br /><br />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create Notes Folder</h1>

        {successMessage && (
          <div className={`mb-4 p-3 rounded ${isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className={`mb-4 p-3 rounded ${isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Parent Path</label>
              <input
                type="text"
                name="parent"
                value={formData.parent}
                onChange={handleChange}
                required
                className={`w-full rounded-md py-2 px-3 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Base Name (used in path)</label>
              <input
                type="text"
                name="baseName"
                value={formData.baseName}
                onChange={handleChange}
                required
                className={`w-full rounded-md py-2 px-3 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border border-gray-300'}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Folder Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className={`w-full rounded-md py-2 px-3 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full rounded-md py-2 px-3 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border border-gray-300'}`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Folder'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NotesFolderForm;
