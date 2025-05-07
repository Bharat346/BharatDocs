// src/components/editor/EditorContent.js
import React from 'react';

export const EditorContent = React.forwardRef(({ onContentChange, onKeyDown }, ref) => {
  return (
    <div
      className="custom-prose prose min-w-[100%] editor flex-1 p-4 border rounded-md bg-white overflow-y-auto focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[450px]"
      contentEditable
      ref={ref}
      onInput={onContentChange}
      onKeyDown={onKeyDown}
      placeholder="Start typing here..."
    />
  );
});