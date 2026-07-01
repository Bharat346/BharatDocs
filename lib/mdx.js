import { LRUCache } from 'lru-cache';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import matter from 'gray-matter';
import { MDXComponents } from '@/components/docs/MDXComponents';
import { unstable_cache } from 'next/cache';

/* ── In-memory LRU cache ── */
const mdxCache = new LRUCache({
  max: 200,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
});

/* ──────────────────────────────────────────
   Fetch doc content from GitHub
   Supports .md and .mdx with auto-fallback
   ────────────────────────────────────────── */
/* ──────────────────────────────────────────
   Fetch doc content from GitHub
   Supports .md and .mdx with auto-fallback
   ────────────────────────────────────────── */
const fetchDocsBase = async (filePath) => {
  const REPO = 'https://api.github.com/repos/Bharat346/docs-storage/contents';

  console.log('[fetchDocsFromGithub] Received filePath:', filePath);

  // Build the URL
  let url = filePath;
  let fallbackUrl = null;

  if (!url.startsWith('http')) {
    const hasExt = /\.(mdx?|md)$/.test(filePath);
    const path = hasExt ? filePath : `${filePath}.mdx`;
    url = `${REPO}/${path.split('/').map(encodeURIComponent).join('/')}`;
    if (!hasExt) {
      fallbackUrl = `${REPO}/${filePath.split('/').map(encodeURIComponent).join('/')}.md`;
    }
  } else {
    // If it's already a full URL, use it exactly as provided without modification.
    console.log('[fetchDocsFromGithub] Using full URL as provided.');
  }

  console.log('[fetchDocsFromGithub] Primary URL to fetch:', url);

  // Auth headers
  const githubToken = process.env.github_AT;
  const headers = {};
  if (githubToken) {
    headers['Authorization'] = `token ${githubToken}`;
    headers['Accept'] = 'application/vnd.github.v3+json';
  }

  const opts = { headers, next: { revalidate: 3600 } };

  // Try primary URL
  let res = await fetch(url, opts);

  // Fallback logic
  if (res.status === 404 && fallbackUrl) {
    console.log(`[fetchDocsFromGithub] 404 on primary. Trying fallback URL: ${fallbackUrl}`);
    res = await fetch(fallbackUrl, opts);
    if (res.ok) url = fallbackUrl;
  }

  if (!res.ok) {
    const errorMsg = res.status === 404 
      ? `Document not found at ${url}${fallbackUrl ? ` or ${fallbackUrl}` : ''}`
      : `GitHub fetch failed: ${url} (${res.status})`;
    throw new Error(errorMsg);
  }

  // Decode response
  const text = await res.text();
  const ct = res.headers.get('content-type') || '';
  
  if (ct.includes('application/json')) {
    try {
      const data = JSON.parse(text);
      if (data.encoding === 'base64' && data.content) {
        return Buffer.from(data.content.replace(/\s/g, ''), 'base64').toString('utf-8');
      }
      return data; // Return as is if not base64 encoded GitHub content
    } catch (e) {
      console.error(`[fetchDocsFromGithub] JSON parse failed for ${url}:`, e);
      // Fallback to returning raw text if JSON parsing fails
    }
  }

  return text;
};

export const fetchDocsFromGithub = process.env.NODE_ENV === 'development' 
  ? fetchDocsBase 
  : unstable_cache(fetchDocsBase, ['github-docs'], { revalidate: 3600 * 24 });


/* ── Extract headings from raw markdown ── */
function extractHeadings(content) {
  const headings = [];
  const regex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2],
      id: match[2].toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
    });
  }
  return headings;
}

/* ── rehype-pretty-code config ── */
const prettyCodeOptions = {
  theme: 'github-dark',
  onVisitLine(node) {
    if (node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }];
    }
  },
  onVisitHighlightedLine(node) {
    node.properties.className = [...(node.properties.className || []), 'line--highlighted'];
  },
  onVisitHighlightedWord(node) {
    node.properties.className = ['word--highlighted'];
  },
};

/* ──────────────────────────────────────────
   Process MDX with multi-layer caching
   Returns { content (JSX), frontmatter, headings }
   ────────────────────────────────────────── */
export async function getProcessedMDX(filePath) {
  // Layer 1: In-memory LRU (fastest)
  if (mdxCache.has(filePath)) {
    return mdxCache.get(filePath);
  }

  // Layer 2: Fetch raw content (Next.js data cache)
  const rawContent = await fetchDocsFromGithub(filePath);

  const { data: frontmatter, content } = matter(rawContent);
  const headings = extractHeadings(content);

  // Pre-process content for better LaTeX support: 
  // Convert \[ and \] to $$ (standard markdown display math)
  // Also fix relative images
  const fileDir = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '';
  const processedContent = content
    .replace(/\\\[/g, '$$$$')
    .replace(/\\\]/g, '$$$$')
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$')
    .replace(/!\[([^\]]*)\]\((?!http)([^)]+)\)/g, (match, alt, imgPathWithTitle) => {
      const [imgPath] = imgPathWithTitle.split(/\s+/);
      const cleanPath = imgPath.replace(/^\.\//, '').replace(/^\//, '');
      const absolutePath = fileDir ? `${fileDir}/${cleanPath}` : cleanPath;
      const resolvedPath = absolutePath.split('/').reduce((acc, part) => {
         if (part === '..') acc.pop();
         else if (part !== '.') acc.push(part);
         return acc;
      }, []).join('/');
      return `![${alt}](https://raw.githubusercontent.com/Bharat346/docs-storage/main/${resolvedPath})`;
    });

  // Layer 3: Compile MDX → React elements
  let compiledContent;
  try {
    const compiled = await compileMDX({
      source: processedContent,
      options: {
        parseFrontmatter: false,
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkMath],
          rehypePlugins: [rehypeSlug, rehypeKatex, [rehypePrettyCode, prettyCodeOptions]],
        },
      },
      components: MDXComponents,
    });
    compiledContent = compiled.content;
  } catch (error) {
    console.warn(`[MDX Warning] Primary compile failed for ${filePath}. Attempting safe fallback...`);
    
    try {
      // Safe fallback: Escape { and } to prevent Acorn JS parsing errors,
      // and escape < if it is followed by a space or number (common math/logic symbols).
      // This allows plain markdown files to render even if they have unescaped characters.
      const safeContent = processedContent
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/<(?=[\s0-9])/g, '&lt;');

      const safeCompiled = await compileMDX({
        source: safeContent,
        options: {
          parseFrontmatter: false,
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkMath],
            rehypePlugins: [rehypeSlug, rehypeKatex, [rehypePrettyCode, prettyCodeOptions]],
          },
        },
        components: MDXComponents,
      });

      compiledContent = (
        <>
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-500 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <strong className="block font-semibold mb-1">Safe Mode Rendering</strong>
              This document contains invalid MDX syntax (like unescaped {'{'} or {'<'}). It has been automatically rendered in safe mode, so some interactive components or styling may not display correctly.
            </div>
          </div>
          {safeCompiled.content}
        </>
      );
    } catch (fallbackError) {
      console.error(`[MDX Error] Safe fallback also failed for ${filePath}:`, fallbackError.message);
      compiledContent = (
        <div className="my-8 p-6 border border-red-500/30 bg-red-500/10 rounded-2xl text-red-400">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Document Compilation Error
          </h3>
          <p className="text-sm mb-4">
            This document could not be rendered because it contains critically invalid MDX syntax that even safe-mode could not recover. 
            Please ensure all JSX tags are properly closed and characters like <code>{'{'}</code> and <code>{'<'}</code> are escaped or wrapped in code blocks.
          </p>
          <div className="p-4 bg-black/40 rounded-xl overflow-x-auto text-xs font-mono border border-red-500/20">
            {error.message}
          </div>
        </div>
      );
    }
  }

  const result = { content: compiledContent, frontmatter, headings };

  // Store in LRU
  mdxCache.set(filePath, result);

  return result;
}
