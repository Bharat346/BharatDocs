"use client";

import { useState } from "react";

export default function AdminNotesPage() {
  const [form, setForm] = useState({
    collectionId: "NOTES_COLLECTION_ID",
    parentId: null,
    name: "",
    nodeType: "note",
    filePath: "",
    fileType: "pdf",
    orderIndex: 0,
    isPublished: true,
  });

  async function handleSubmit(e) {
    e.preventDefault();

    await fetch("/api/admin/nodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    alert("Note added");
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Add Notes Node</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Name"
          className="input"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <select
          className="input"
          onChange={(e) => setForm({ ...form, nodeType: e.target.value })}
        >
          <option value="folder">Folder</option>
          <option value="note">Note</option>
        </select>

        {form.nodeType === "note" && (
          <>
            <input
              placeholder="File path"
              className="input"
              onChange={(e) =>
                setForm({ ...form, filePath: e.target.value })
              }
            />
          </>
        )}

        <button className="btn">Create</button>
      </form>
    </div>
  );
}
