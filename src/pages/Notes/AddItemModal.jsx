// src/components/NotesManager/AddItemModal.jsx
import { useState } from "react";

const AddItemModal = ({ type, onClose, onSubmit, isDark }) => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === "Folder") {
      onSubmit({
        type: "Folder",
        title: title || name,
        baseName: name,
        parent: "", 
        children: [],
        subfolders: {},
      });
    } else {
      onSubmit({
        type: "File",
        name,
        url,
        format: name.split(".").pop().toLowerCase(),
      });
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}
    >
      <div
        className={`p-6 rounded-lg shadow-xl w-full max-w-md ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2
          className={`text-xl font-bold mb-4 ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          Add {type}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className={`block mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {type === "Folder" ? "Folder Name" : "File Name"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-2 border rounded ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              }`}
              required
            />
          </div>

          {type === "Folder" && (
            <div className="mb-4">
              <label
                className={`block mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Display Title (optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full p-2 border rounded ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>
          )}

          {type === "File" && (
            <div className="mb-4">
              <label
                className={`block mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                File URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={`w-full p-2 border rounded ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded ${
                isDark
                  ? "bg-gray-600 hover:bg-gray-500"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded ${
                isDark
                  ? "bg-blue-600 hover:bg-blue-500"
                  : "bg-blue-500 hover:bg-blue-400"
              } text-white`}
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
