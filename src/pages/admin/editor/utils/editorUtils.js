// src/components/editor/utils/editorUtils.js
export const cleanHTML = (html) => {
    return html.replace(/<font[^>]*>(.*?)<\/font>/gi, "$1");
  };
  
  export const styleLists = (editorRef) => {
    if (!editorRef.current) return;
  
    const lists = editorRef.current.querySelectorAll("ul, ol");
    lists.forEach((list) => {
      list.style.marginLeft = "20px";
      list.style.paddingLeft = "20px";
    });
  
    const uls = editorRef.current.querySelectorAll("ul");
    uls.forEach((ul) => {
      ul.style.listStyleType = "disc";
    });
  
    const ols = editorRef.current.querySelectorAll("ol");
    ols.forEach((ol) => {
      ol.style.listStyleType = "decimal";
    });
  };
  
  export const cleanFontTags = (editorRef, fontSize) => {
    if (!editorRef.current) return;
    const fontElements = editorRef.current.querySelectorAll("font[size]");
    fontElements.forEach((font) => {
      const span = document.createElement("span");
      span.style.fontSize = font.style.fontSize || `${fontSize}px`;
      span.innerHTML = font.innerHTML;
      font.replaceWith(span);
    });
  };