// components/MarkdownRenderer.server.tsx
import React from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import matter from "gray-matter";
import "highlight.js/styles/github-dark.css";
import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";
import "@/styles/custom.css";

// Keyword mapping for special tag styling - matches your custom.css
const KEYWORD_CLASSES = {
  // Programming languages
  node: "keyword-node",
  react: "keyword-react",
  javascript: "keyword-javascript",
  typescript: "keyword-typescript",
  python: "keyword-python",
  bash: "keyword-bash",
  shell: "keyword-bash",
  sh: "keyword-bash",

  // Tools & platforms
  docker: "keyword-docker",
  npm: "keyword-npm",
  yarn: "keyword-yarn",
  pnpm: "keyword-npm",
  git: "keyword-git",
  github: "keyword-git",
  gitlab: "keyword-git",

  // Commands
  install: "keyword-bash",
  run: "keyword-bash",
  build: "keyword-bash",
  start: "keyword-bash",
  test: "keyword-bash",

  // Technologies
  nextjs: "keyword-react",
  "next.js": "keyword-react",
  vue: "keyword-react",
  angular: "keyword-react",
  svelte: "keyword-react",
  express: "keyword-node",
  nestjs: "keyword-node",
  fastapi: "keyword-python",
  django: "keyword-python",
  flask: "keyword-python",
};

// Helper function to generate slug from text
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

// Helper function to process HTML and add heading IDs, anchor links, and keyword styling
const processHtmlContent = (
  html, 
  theme,
  headingRefs = {}
) => {
  // Create a virtual DOM to manipulate the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Process headings with proper styling classes
  const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headingElements.forEach((heading, index) => {
    const text = heading.textContent || `heading-${index}`;
    const slug = generateSlug(text);
    
    // Add ID to heading
    heading.id = slug;
    
    // Add Tailwind classes based on heading level
    switch(heading.tagName.toLowerCase()) {
      case 'h1':
        heading.className = cn(
          heading.className,
          "text-4xl font-bold mb-8 mt-12 pb-4 border-b heading-h1",
          theme === "dark" ? "border-zinc-800 text-white" : "border-gray-200 text-gray-900"
        );
        break;
      case 'h2':
        heading.className = cn(
          heading.className,
          "text-3xl font-bold mb-6 mt-10 pb-3 border-b heading-h2",
          theme === "dark" ? "border-zinc-800 text-white" : "border-gray-200 text-gray-900"
        );
        break;
      case 'h3':
        heading.className = cn(
          heading.className,
          "text-2xl font-semibold mb-4 mt-8 heading-h3",
          theme === "dark" ? "text-zinc-100" : "text-gray-800"
        );
        break;
      case 'h4':
        heading.className = cn(
          heading.className,
          "text-xl font-semibold mb-3 mt-6 heading-h4",
          theme === "dark" ? "text-zinc-200" : "text-gray-700"
        );
        break;
      default:
        heading.className = cn(
          heading.className,
          theme === "dark" ? "text-zinc-300" : "text-gray-700"
        );
    }
    
    // Create anchor wrapper
    const wrapper = document.createElement('div');
    wrapper.className = "relative group heading-wrapper";
    
    // Create anchor link
    const anchor = document.createElement('a');
    anchor.href = `#${slug}`;
    anchor.className = cn(
      "absolute -left-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 heading-anchor",
      theme === "dark" ? "text-zinc-500 hover:text-orange-400" : "text-gray-400 hover:text-orange-500"
    );
    anchor.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linecap="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
      </svg>
    `;
    
    // Wrap heading
    heading.parentNode?.insertBefore(wrapper, heading);
    wrapper.appendChild(heading);
    heading.appendChild(anchor);
    
    // Store reference (for client-side hydration)
    headingRefs.current[slug] = heading;
  });
  
  // Process paragraphs
  const paragraphElements = doc.querySelectorAll('p');
  paragraphElements.forEach((p) => {
    p.className = cn(
      p.className,
      "mb-6 leading-relaxed prose-paragraph",
      theme === "dark" ? "text-zinc-300" : "text-gray-700"
    );
  });
  
  // Process lists
  const ulElements = doc.querySelectorAll('ul');
  ulElements.forEach((ul) => {
    ul.className = cn(
      ul.className,
      "mb-6 pl-5 space-y-2 list-disc prose-list",
      theme === "dark" ? "text-zinc-300" : "text-gray-700"
    );
  });
  
  const olElements = doc.querySelectorAll('ol');
  olElements.forEach((ol) => {
    ol.className = cn(
      ol.className,
      "mb-6 pl-5 space-y-2 list-decimal prose-list",
      theme === "dark" ? "text-zinc-300" : "text-gray-700"
    );
  });
  
  const liElements = doc.querySelectorAll('li');
  liElements.forEach((li) => {
    li.className = cn(
      li.className,
      "relative pl-2 prose-list-item",
      theme === "dark" ? "text-zinc-300" : "text-gray-700"
    );
  });
  
  // Process links
  const linkElements = doc.querySelectorAll('a');
  linkElements.forEach((a) => {
    if (a.hash && a.hash.startsWith('#')) {
      // Skip anchor links (we handle them separately)
      return;
    }
    a.className = cn(
      a.className,
      "inline-flex items-center gap-1 font-medium border-b transition-all prose-link",
      theme === "dark"
        ? "text-blue-400 hover:text-blue-300 border-blue-400/30 hover:border-blue-300"
        : "text-blue-600 hover:text-blue-700 border-blue-600/30 hover:border-blue-700"
    );
    
    // Add external link icon for external links
    if (a.href && (a.href.startsWith('http://') || a.href.startsWith('https://'))) {
      const icon = document.createElement('span');
      icon.innerHTML = `
        <svg class="w-3 h-3 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linecap="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
        </svg>
      `;
      a.appendChild(icon);
    }
  });
  
  // Process inline code for keyword styling
  const codeElements = doc.querySelectorAll('code');
  codeElements.forEach((code) => {
    // Skip if inside pre (code block)
    if (code.parentElement?.tagName === 'PRE') return;
    
    const codeText = code.textContent || '';
    const trimmedText = codeText.trim();
    
    // Check if it's a simple word for tag styling
    const isSimpleWord = /^[a-zA-Z0-9_-]+$/.test(trimmedText);
    
    if (isSimpleWord) {
      const word = trimmedText.toLowerCase();
      const keywordClass = KEYWORD_CLASSES[word] || '';
      
      // Check for prefixes like $ npm, # command, etc.
      let prefix = '';
      let displayText = codeText;
      
      if (codeText.startsWith('$ ')) {
        prefix = '$';
        displayText = codeText.substring(2);
      } else if (codeText.startsWith('# ')) {
        prefix = '#';
        displayText = codeText.substring(2);
      } else if (codeText.startsWith('> ')) {
        prefix = '>';
        displayText = codeText.substring(2);
      }
      
      // Create new span with tag styling
      const tagSpan = document.createElement('span');
      tagSpan.className = cn(
        'inline-code-tag',
        keywordClass,
        prefix && 'with-prefix'
      );
      
      if (prefix) {
        const prefixSpan = document.createElement('span');
        prefixSpan.className = 'prefix';
        prefixSpan.textContent = prefix;
        tagSpan.appendChild(prefixSpan);
        tagSpan.appendChild(document.createTextNode(' ' + displayText));
      } else {
        tagSpan.textContent = displayText;
      }
      
      // Replace code element with styled span
      code.parentNode?.replaceChild(tagSpan, code);
    } else {
      // For complex inline code, add styling classes
      code.className = cn(
        code.className,
        'inline-code px-2 py-1 rounded-md font-mono text-sm prose-inline-code',
        theme === "dark" 
          ? "bg-zinc-800 text-zinc-200" 
          : "bg-gray-100 text-gray-800"
      );
    }
  });
  
  // Process code blocks with highlight.js support
  const preElements = doc.querySelectorAll('pre');
  preElements.forEach((pre) => {
    // Add main styling for <pre>
    pre.className = cn(
      pre.className,
      "relative my-8 rounded-xl overflow-hidden border prose-code-block",
      theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-200"
    );

    const code = pre.querySelector('code');
    if (code) {
      // Extract language from className
      const language = code.className.replace('language-', '') || 'text';
      
      // Ensure highlight.js classes are properly applied
      code.className = cn(
        code.className,
        'hljs',
        language ? `language-${language}` : '',
        "block whitespace-pre overflow-x-auto p-4 m-0 prose-code-content",
        theme === "dark" ? "text-zinc-100" : "text-gray-800"
      );

      // Create header container
      const header = document.createElement('div');
      header.className = cn(
        "flex items-center justify-between px-4 py-3 border-b prose-code-header",
        theme === "dark" ? "bg-zinc-800 border-zinc-700" : "bg-gray-100 border-gray-200"
      );

      // Add language badge and copy button
      header.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="font-mono text-sm font-medium ${
            theme === "dark" ? "text-zinc-300" : "text-gray-700"
          }">${language}</span>
        </div>
        <button class="copy-btn flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          theme === "dark" ? "hover:bg-zinc-700 text-zinc-300" : "hover:bg-gray-200 text-gray-700"
        }" data-clipboard-target="pre code">
          <span>Copy</span>
        </button>
      `;

      // Insert header at the top of <pre>
      pre.insertBefore(header, pre.firstChild);
    }
  });
  
  // Process blockquotes
  const blockquoteElements = doc.querySelectorAll('blockquote');
  blockquoteElements.forEach((blockquote) => {
    // Create wrapper div with mdx-blockquote-wrapper class
    const wrapper = document.createElement('div');
    wrapper.className = cn(
      'mdx-blockquote-wrapper prose-blockquote',
      theme === "dark" 
        ? "bg-gradient(145deg, #1f2937, #101b32ff) text-zinc-300 border-l-2 border-blue-500"
        : "bg-gradient(145deg, #ffffff, #f3f4f6) text-gray-700 border-l-2 border-blue-600"
    );
    
    // Add quote icon
    const quoteIcon = document.createElement('div');
    quoteIcon.className = 'quote-icon';
    quoteIcon.innerHTML = '❝';
    
    wrapper.appendChild(quoteIcon);
    
    // Style the blockquote
    blockquote.className = cn(
      blockquote.className,
      "m-0 p-6 text-lg italic prose-blockquote-content"
    );
    
    // Wrap blockquote
    blockquote.parentNode?.insertBefore(wrapper, blockquote);
    wrapper.appendChild(blockquote);
  });
  
  // Process tables
  const tableElements = doc.querySelectorAll('table');
  tableElements.forEach((table) => {
    const wrapper = document.createElement('div');
    wrapper.className = cn(
      "overflow-x-auto my-8 rounded-lg border prose-table-wrapper",
      theme === "dark" 
        ? "border-zinc-800 bg-zinc-900/50" 
        : "border-gray-200 bg-gray-50"
    );
    
    table.parentNode?.insertBefore(wrapper, table);
    wrapper.appendChild(table);
    
    // Style table
    table.className = cn(
      table.className,
      "w-full border-collapse prose-table",
      theme === "dark" ? "text-zinc-300" : "text-gray-700"
    );
    
    // Style table headers
    const thElements = table.querySelectorAll('th');
    thElements.forEach((th) => {
      th.className = cn(
        th.className,
        "px-4 py-3 text-left font-semibold border-b prose-table-header",
        theme === "dark" 
          ? "border-zinc-800 bg-zinc-800/50" 
          : "border-gray-200 bg-gray-100"
      );
    });
    
    // Style table cells
    const tdElements = table.querySelectorAll('td');
    tdElements.forEach((td) => {
      td.className = cn(
        td.className,
        "px-4 py-3 border-b prose-table-cell",
        theme === "dark" ? "border-zinc-800" : "border-gray-200"
      );
    });
  });
  
  // Process images with proxy
  const imgElements = doc.querySelectorAll('img');
  imgElements.forEach((img) => {
    const wrapper = document.createElement('figure');
    wrapper.className = "my-10 prose-image-wrapper";
    
    img.parentNode?.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    
    const src = img.getAttribute('src');
    // Check if it's an external image
    if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
      // Use image proxy for external images
      img.setAttribute('src', `/api/image-proxy?url=${encodeURIComponent(src)}`);
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
      img.setAttribute('referrerPolicy', 'no-referrer');
    }
    
    // Style image
    img.className = cn(
      img.className,
      "mx-auto max-w-full h-auto rounded-xl border transition-shadow duration-300 prose-image",
      theme === "dark" 
        ? "border-zinc-800 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]" 
        : "border-gray-200 shadow-lg"
    );
    
    // Add alt text as caption if exists
    const alt = img.getAttribute('alt');
    if (alt && alt.trim()) {
      const figcaption = document.createElement('figcaption');
      figcaption.className = cn(
        "mt-3 text-center text-sm italic prose-image-caption",
        theme === "dark" ? "text-zinc-500" : "text-gray-500"
      );
      figcaption.textContent = alt;
      wrapper.appendChild(figcaption);
    }
  });
  
  // Process horizontal rules
  const hrElements = doc.querySelectorAll('hr');
  hrElements.forEach((hr) => {
    hr.className = cn(
      hr.className,
      "my-12 border-0 h-px prose-hr",
      theme === "dark" 
        ? "bg-gradient-to-r from-transparent via-zinc-700 to-transparent" 
        : "bg-gradient-to-r from-transparent via-gray-300 to-transparent"
    );
  });
  
  // Process strong elements
  const strongElements = doc.querySelectorAll('strong, b');
  strongElements.forEach((strong) => {
    strong.className = cn(
      strong.className,
      "font-bold prose-strong",
      theme === "dark" ? "text-white" : "text-gray-900"
    );
  });
  
  // Process emphasis elements
  const emElements = doc.querySelectorAll('em, i');
  emElements.forEach((em) => {
    em.className = cn(
      em.className,
      "italic prose-emphasis",
      theme === "dark" ? "text-zinc-300" : "text-gray-700"
    );
  });
  
  // Process custom alert/note boxes
  const alertElements = doc.querySelectorAll('.note, .tip, .warning, .caution, .danger, .error');
  alertElements.forEach((alert) => {
    const className = alert.className;
    
    if (className.includes('note') || className.includes('tip')) {
      alert.className = cn(
        alert.className,
        "my-6 p-4 rounded-lg border flex items-start gap-3 prose-alert prose-alert-info",
        theme === "dark" 
          ? "border-blue-500/30 bg-blue-500/10 text-zinc-300" 
          : "border-blue-500/40 bg-blue-50 text-gray-700"
      );
    } else if (className.includes('warning') || className.includes('caution')) {
      alert.className = cn(
        alert.className,
        "my-6 p-4 rounded-lg border flex items-start gap-3 prose-alert prose-alert-warning",
        theme === "dark" 
          ? "border-amber-500/30 bg-amber-500/10 text-zinc-300" 
          : "border-amber-500/40 bg-amber-50 text-gray-700"
      );
    } else if (className.includes('danger') || className.includes('error')) {
      alert.className = cn(
        alert.className,
        "my-6 p-4 rounded-lg border flex items-start gap-3 prose-alert prose-alert-danger",
        theme === "dark" 
          ? "border-red-500/30 bg-red-500/10 text-zinc-300" 
          : "border-red-500/40 bg-red-50 text-gray-700"
      );
    }
  });
  
  return doc.body.innerHTML;
};

export default async function MarkdownRenderer({ 
  content, 
  theme = "dark",
  headingRefs = { current: {} }
}) {
  if (!content) return <p>Loading content...</p>;

  // Parse frontmatter using gray-matter
  const { data: frontmatter, content: markdownContent } = matter(content);

  // Server-side Markdown → HTML conversion with highlight.js
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeHighlight, { 
      // highlight.js configuration
      detect: true,
      ignoreMissing: true,
      aliases: {
        js: 'javascript',
        ts: 'typescript',
        py: 'python',
        sh: 'bash',
        shell: 'bash'
      }
    })
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(markdownContent);

  const rawHtml = result.toString();
  
  // Process HTML to add custom styling and collect headings
  const processedHtml = processHtmlContent(rawHtml, theme, headingRefs);

  // Container styles using Tailwind classes only
  const containerStyles = cn(
    // Base styling
    "mdx-content max-w-none transition-colors duration-300",
    theme === "dark" ? "dark-theme" : "light-theme",
    
    // Base font styling
    "font-sans antialiased",
    
    // Responsive text
    "text-base leading-relaxed",
    
    // Selection styling via Tailwind
    "selection:bg-orange-600 selection:text-black"
  );

  return (
    <>
      {/* SEO Meta from frontmatter */}
      {frontmatter.title && <title>{frontmatter.title}</title>}
      {frontmatter.description && (
        <meta name="description" content={frontmatter.description} />
      )}

      {/* Render processed Markdown content */}
      <div
        className={containerStyles}
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
      
      {/* Client-side script to handle copy buttons and interactivity */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              // Initialize highlight.js after content is loaded
              if (window.hljs) {
                document.querySelectorAll('pre code').forEach((block) => {
                  window.hljs.highlightElement(block);
                });
              }
              
              // Handle copy buttons
              document.querySelectorAll('.copy-btn').forEach(button => {
                button.addEventListener('click', async function() {
                  const pre = this.closest('pre');
                  const code = pre?.querySelector('code');
                  if (!code) return;
                  
                  try {
                    await navigator.clipboard.writeText(code.textContent || '');
                    const originalText = this.innerHTML;
                    this.innerHTML = '<span class="text-green-500">✓ Copied!</span>';
                    
                    setTimeout(() => {
                      this.innerHTML = originalText;
                    }, 2000);
                  } catch (err) {
                    console.error('Failed to copy:', err);
                  }
                });
              });
              
              // Smooth scroll for anchor links
              document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                  const href = this.getAttribute('href');
                  if (href === '#') return;
                  
                  const target = document.querySelector(href);
                  if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                    
                    // Update URL without page reload
                    history.pushState(null, null, href);
                  }
                });
              });
              
              // Highlight current section in viewport
              function highlightCurrentSection() {
                const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
                const scrollPosition = window.scrollY + 100;
                
                let currentHeading = null;
                for (const heading of headings) {
                  if (heading.offsetTop <= scrollPosition) {
                    currentHeading = heading;
                  } else {
                    break;
                  }
                }
                
                // Update active state for anchor links
                document.querySelectorAll('a[href^="#"]').forEach(link => {
                  link.classList.remove('active');
                  if (currentHeading && link.getAttribute('href') === '#' + currentHeading.id) {
                    link.classList.add('active');
                  }
                });
              }
              
              window.addEventListener('scroll', highlightCurrentSection);
              highlightCurrentSection(); // Initial call
            });
          `
        }}
      />
      
      {/* Load highlight.js dynamically */}
      <script
        src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"
        integrity="sha512-rdhY3cbXURo13l/WU9VlaRyaIYeJ/KBakckXIvJNAQde8DgpOmE+eZf7ha4vdqVjTtwQt69bD2wH2LXob/LB7Q=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      ></script>
      <script
        src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/languages/javascript.min.js"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      ></script>
      <script
        src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/languages/typescript.min.js"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      ></script>
      <script
        src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/languages/python.min.js"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      ></script>
      <script
        src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/languages/bash.min.js"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      ></script>
    </>
  );
}