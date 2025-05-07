// src/pages/TextEditor.js
import React, { useRef, useState, useEffect } from 'react';
import { EditorToolbar } from './editor/EditorToolbar';
import { EditorContent } from './editor/EditorContent';
import { ShortcutsDialog } from './editor/ShortcutsDialog';
import { createMdxConverter } from './editor/utils/mdxConverter';
import { cleanHTML, styleLists, cleanFontTags } from './editor/utils/editorUtils';
import { insertAccordion } from './editor/components/Accordian';
import { createGitHubFileManager } from '@/lib/githubUtils';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FaSave, FaLink } from 'react-icons/fa';

const TextEditor = () => {
  const editorRef = useRef(null);
  const [filePath, setFilePath] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState('16');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const mdxConverter = createMdxConverter();

  useEffect(() => {
    const savedContent = localStorage.getItem("textEditorContent");
    if (savedContent && editorRef.current) {
      editorRef.current.innerHTML = savedContent;
      styleLists(editorRef);
      cleanFontTags(editorRef, fontSize);
    }
  }, [fontSize]);

  const applyStyle = (command, value = null) => {
    document.execCommand(command, false, value);
    saveContentToLocal();
    editorRef.current?.focus();

    if (command === "insertUnorderedList" || command === "insertOrderedList") {
      setTimeout(() => styleLists(editorRef), 50);
    }
  };

  const saveContentToLocal = () => {
    if (!editorRef.current) return;
    const cleanedHTML = cleanHTML(editorRef.current.innerHTML);
    localStorage.setItem("textEditorContent", cleanedHTML);
    setContent(cleanedHTML);
  };

  const handleContentChange = () => {
    saveContentToLocal();
  };

  const convertToMDX = (html) => {
    try {
      return mdxConverter.turndown(html);
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Failed to convert to MDX");
      return html;
    }
  };

  const insertElement = (html) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    range.deleteContents();
    range.insertNode(wrapper);

    range.setStartAfter(wrapper);
    range.setEndAfter(wrapper);
    selection.removeAllRanges();
    selection.addRange(range);

    saveContentToLocal();
  };

  const insertImage = () => {
    const imageUrl = prompt("Enter image URL:");
    if (imageUrl) {
      const altText = prompt("Enter image description (alt text):", "Image");
      insertElement(
        `<img src="${imageUrl}" alt="${altText}" style="max-width:100%; display:block; margin:1rem 0;" />`
      );
      toast.success("Image inserted");
    }
  };

  const insertTable = () => {
    const rows = parseInt(prompt("Enter number of rows (1-30):") || "3");
    const cols = parseInt(prompt("Enter number of columns (1-15):") || "3");

    if (rows > 0 && cols > 0 && rows <= 30 && cols <= 15) {
      const table = `
        <table style="border-collapse: collapse; width: 100%; margin: 1rem 0;">
          ${Array.from(
            { length: rows },
            () => `
            <tr>${Array.from(
              { length: cols },
              () => `
              <td style="border: 1px solid #ddd; padding: 8px;" contenteditable="true">&nbsp;</td>
            `
            ).join("")}</tr>
          `
          ).join("")}
        </table>
      `;
      insertElement(table);
      toast.success(`Inserted ${rows}x${cols} table`);
    } else {
      toast.error("Please enter valid numbers between 1-30 for rows and 1-15 for columns");
    }
  };

  const insertCodeBlock = () => {
    const lang = prompt("Enter the programming language (e.g., js, python, html):") || "";
    
    const codeBlock = `
      <pre style="
        background: #1e1e1e;
        color: #f8f8f2;
        padding: 1rem;
        border-radius: 4px;
        overflow: auto;
        font-family: monospace;
        margin: 1rem 0;
      ">
        <code class="language-${lang}" contenteditable="true">// Your ${lang || "code"} here...</code>
      </pre>
    `;
  
    insertElement(codeBlock);
    toast.success(`Code block (${lang || "plain text"}) inserted`);
  };

  const insertHorizontalRule = () => {
    insertElement('<hr style="border: 1px solid #ddd; margin: 1rem 0;" />');
    toast.success("Horizontal rule inserted");
  };

  const handleInsertAccordion = () => {
    insertAccordion(editorRef);
    saveContentToLocal();
  };

  const saveContentToPath = async () => {
    if (!filePath) {
      toast.error("Please enter a valid file path");
      return;
    }
  
    setIsSubmitting(true);
    try {
      let finalPath = filePath.trim();
      if (!finalPath.toLowerCase().endsWith(".mdx")) {
        finalPath = `${finalPath}.mdx`;
      }
  
      const pathParts = finalPath.split('/');
      if (pathParts.length !== 2) {
        throw new Error("Path must be in format 'folder/filename'");
      }
  
      const [folderName, fileName] = pathParts;
      const fullFilePath = `${finalPath}`;
      const metadataPath = `${folderName}/metadata.json`;
      const baseFileName = fileName.replace('.mdx', '');
  
      const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
      const githubOwner = import.meta.env.VITE_GITHUB_OWNER;
      const githubRepo = import.meta.env.VITE_GITHUB_REPO;
      const branch = import.meta.env.VITE_GITHUB_BRANCH || 'main';
  
      if (!githubToken || !githubOwner || !githubRepo) {
        throw new Error("GitHub configuration is missing");
      }
  
      const { getFile } = createGitHubFileManager(
        githubToken,
        githubOwner,
        githubRepo
      );
  
      let metadata;
      try {
        const metadataContent = await getFile(metadataPath, branch);
        metadata = JSON.parse(metadataContent);
      } catch (error) {
        if (error.message === 'File not found') {
          throw new Error(`Folder '${folderName}' not found - metadata.json doesn't exist`);
        }
        throw error;
      }
  
      if (metadata.folderName !== folderName) {
        throw new Error(`Folder name in metadata.json (${metadata.folderName}) doesn't match path (${folderName})`);
      }
  
      const fileExistsInSubLinks = metadata.subLinks?.some(
        link => link.url === baseFileName
      );
  
      if (!fileExistsInSubLinks) {
        throw new Error(`File '${baseFileName}' not found in subLinks of ${folderName}/metadata.json. Please add it first.`);
      }
  
      const currentContent = content || editorRef.current?.innerHTML || "";
      const mdxContent = convertToMDX(currentContent);
  
      localStorage.setItem(`mdx:${finalPath}`, mdxContent);
      setFilePath(finalPath);
  
      const { uploadFile } = createGitHubFileManager(
        githubToken,
        githubOwner,
        githubRepo
      );
  
      const commitMessage = `Update ${finalPath} via CMS`;
      const result = await uploadFile(
        fullFilePath,
        mdxContent,
        commitMessage,
        branch
      );
  
      toast.success(`MDX content saved to GitHub: ${finalPath}`);
      console.log("GitHub save result:", result);
  
    } catch (error) {
      console.error("Error saving content to GitHub:", error);
      
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("GitHub authentication failed - check your token");
        } else if (error.response.status === 403) {
          toast.error("Permission denied - check repository access");
        } else if (error.response.status === 404) {
          toast.error("Repository not found - check owner/repo name");
        } else {
          toast.error(`GitHub error: ${error.response.data.message || "Unknown error"}`);
        }
      } else {
        toast.error(`Validation failed: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscape = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    let currentNode = range.commonAncestorContainer;

    if (currentNode.nodeType === Node.TEXT_NODE) {
      currentNode = currentNode.parentNode;
    }

    if (currentNode instanceof HTMLElement) {
      if (currentNode.tagName === "SUP" || currentNode.tagName === "SUB") {
        const textNode = document.createTextNode(currentNode.textContent || "");
        currentNode.replaceWith(textNode);
        range.selectNodeContents(textNode);
        range.collapse(true);
        toast.info("Exited superscript/subscript");
        return;
      }

      if (currentNode.tagName === "CODE" || currentNode.tagName === "PRE") {
        const newLine = document.createElement("p");
        newLine.innerHTML = "<br>";
        currentNode.after(newLine);

        range.selectNodeContents(newLine);
        range.collapse(true);
        toast.info("Exited code block");
        return;
      }

      if (currentNode.tagName === "TABLE" || currentNode.closest("table")) {
        const table =
          currentNode.tagName === "TABLE"
            ? currentNode
            : currentNode.closest("table");
        if (table) {
          const newLine = document.createElement("p");
          newLine.innerHTML = "<br>";
          table.after(newLine);

          range.selectNodeContents(newLine);
          range.collapse(true);
          toast.info("Exited table");
          return;
        }
      }
    }

    const newLine = document.createElement("p");
    newLine.innerHTML = "<br>";
    editorRef.current.appendChild(newLine);

    range.selectNodeContents(newLine);
    range.collapse(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.execCommand("insertLineBreak");
    }

    // Formatting shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          applyStyle("bold");
          toast.info("Bold formatting applied");
          return;
        case "i":
          e.preventDefault();
          applyStyle("italic");
          toast.info("Italic formatting applied");
          return;
        case "u":
          e.preventDefault();
          applyStyle("underline");
          toast.info("Underline formatting applied");
          return;
        case "h":
          e.preventDefault();
          insertHorizontalRule();
          return;
        case "z":
          e.preventDefault();
          document.execCommand("undo");
          toast.info("Undo last action");
          return;
        case "y":
          e.preventDefault();
          document.execCommand("redo");
          toast.info("Redo last action");
          return;
        case "s":
          e.preventDefault();
          saveContentToLocal();
          toast.info("Content saved locally");
          return;
        case "l":
          e.preventDefault();
          const url = prompt("Enter URL:");
          if (url) {
            applyStyle("createLink", url);
            toast.success("Link inserted!");
          }
          return;
      }
    }

    // Alt+Shift shortcuts
    if (e.shiftKey && e.altKey) {
      switch (e.key.toLowerCase()) {
        case "u":
          e.preventDefault();
          applyStyle("insertUnorderedList");
          toast.info("Bullet list inserted");
          return;
        case "o":
          e.preventDefault();
          applyStyle("insertOrderedList");
          toast.info("Numbered list inserted");
          return;
        case "s":
          e.preventDefault();
          applyStyle("subscript");
          toast.info("Subscript formatting applied");
          return;
        case "p":
          e.preventDefault();
          applyStyle("superscript");
          toast.info("Superscript formatting applied");
          return;
        case "t":
          e.preventDefault();
          insertTable();
          return;
        case "c":
          e.preventDefault();
          insertCodeBlock();
          return;
        case "a":
          e.preventDefault();
          handleInsertAccordion();
          return;
      }
    }

    if (e.key === "Escape") {
      e.preventDefault();
      handleEscape();
    }
  };

  return (
    <div className="flex flex-col h-full p-6 bg-background w-full max-w-4xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex items-center gap-4 mb-4">
        <Input
          type="text"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          placeholder="Enter file path (e.g., folder/filename)"
          className="flex-1"
        />
        <Button onClick={saveContentToLocal}>
          <FaSave className="mr-2" />
          Save (Ctrl+S)
        </Button>
        <Button onClick={saveContentToPath} disabled={isSubmitting}>
          <FaLink className="mr-2" />
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>

      <EditorToolbar
        onStyleApply={applyStyle}
        onInsertImage={insertImage}
        onInsertTable={insertTable}
        onInsertCodeBlock={insertCodeBlock}
        onInsertAccordion={handleInsertAccordion}
        onInsertHorizontalRule={insertHorizontalRule}
        onColorChange={(newColor) => {
          setColor(newColor);
          applyStyle('foreColor', newColor);
        }}
        onFontChange={setFontFamily}
        onFontSizeChange={setFontSize}
        onSaveLocal={saveContentToLocal}
        onSaveToGitHub={saveContentToPath}
        color={color}
        fontFamily={fontFamily}
        fontSize={fontSize}
      />

      <EditorContent
        ref={editorRef}
        onContentChange={handleContentChange}
        onKeyDown={handleKeyDown}
      />

      <ShortcutsDialog />
    </div>
  );
};

export default TextEditor;