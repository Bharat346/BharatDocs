// src/components/editor/utils/mdxConverter.js
import TurndownService from "turndown";

export const createMdxConverter = () => {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
    linkStyle: "inlined",
  });

  // Enhanced list handling for MDX
  turndownService.addRule("lists", {
    filter: ["ul", "ol"],
    replacement: (content, node) => {
      const isOrdered = node.nodeName === "OL";
      const items = content.split("\n").filter((item) => item.trim());
      const indent = "  ";

      const processedItems = items
        .map((item) => {
          if (item.includes("<ul>") || item.includes("<ol>")) {
            return `${indent}${item}`;
          }
          return item;
        })
        .join("\n");

      return isOrdered ? `1. ${processedItems}\n\n` : `- ${processedItems}\n\n`;
    },
  });

  // Code blocks with language detection
  turndownService.addRule("pre", {
    filter: "pre",
    replacement: (content, node) => {
      const codeElement = node.querySelector("code");
      const lang = codeElement?.className?.replace("language-", "") || "";
      return `\`\`\`${lang}\n${content}\n\`\`\`\n\n`;
    },
  });

  // Tables
  turndownService.addRule("table", {
    filter: "table",
    replacement: function (content, node) {
      let markdownTable = "\n";
      const rows = Array.from(node.rows);

      rows.forEach((row, rowIndex) => {
        const cells = Array.from(row.cells).map((cell) =>
          cell.textContent.trim()
        );
        markdownTable += `| ${cells.join(" | ")} |\n`;

        if (rowIndex === 0) {
          markdownTable += `|${cells.map(() => " --- ").join("|")}|\n`;
        }
      });

      return markdownTable + "\n";
    },
  });

  // Add other rules...
  turndownService.addRule("superscript", {
    filter: "sup",
    replacement: (content) => `<sup>${content}</sup>`,
  });

  turndownService.addRule("subscript", {
    filter: "sub",
    replacement: (content) => `<sub>${content}</sub>`,
  });

  turndownService.addRule("accordion", {
    filter: (node) => {
      return node.nodeName === 'DIV' && node.getAttribute('data-component') === 'accordion';
    },
    replacement: (content, node) => {
      const title = node.getAttribute('data-title') || 'Accordion';
      return `<Accordion title="${title}">\n${content}\n</Accordion>\n\n`;
    }
  });

  // In mdxConverter.js
  turndownService.addRule("tableLists", {
    filter: (node) => {
      return (
        node.nodeName === "TD" &&
        (node.querySelector("ul") || node.querySelector("ol"))
      );
    },
    replacement: (content, node) => {
      // Preserve the list HTML within table cells
      return content;
    },
  });

  return turndownService;
};
