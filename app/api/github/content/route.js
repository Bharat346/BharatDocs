import { NextResponse } from "next/server";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import matter from "gray-matter";

const GITHUB_API_PREFIX = "https://api.github.com/repos/";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "Missing required query param: url" },
        { status: 400 },
      );
    }

    if (!url.startsWith(GITHUB_API_PREFIX)) {
      return NextResponse.json(
        { error: "Invalid GitHub API URL" },
        { status: 400 },
      );
    }

    const githubToken = process.env.github_AT;
    if (!githubToken) {
      return NextResponse.json(
        { error: "GitHub access token not configured" },
        { status: 500 },
      );
    }

    const headers = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `token ${githubToken}`,
    };

    const response = await fetch(url, {
      headers,
      cache: "no-store", // avoid stale private content
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "GitHub API error",
          status: response.status,
          statusText: response.statusText,
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    if (data.type !== "file" || !data.content || data.encoding !== "base64") {
      return NextResponse.json(
        { error: "Response is not a valid file" },
        { status: 400 },
      );
    }

    const rawContent = Buffer.from(
      data.content.replace(/\s/g, ""),
      "base64",
    ).toString("utf-8");

    // Parse frontmatter
    const { data: frontmatter, content: markdownContent } = matter(rawContent);

    // Process Markdown -> HTML
    const processedContent = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkRehype)
      .use(rehypeHighlight, {
        detect: true,
        ignoreMissing: true,
        aliases: {
          js: "javascript",
          ts: "typescript",
          py: "python",
          sh: "bash",
          shell: "bash",
        },
      })
      .use(rehypeKatex)
      .use(rehypeStringify)
      .process(markdownContent);

    const html = processedContent.toString();

    return NextResponse.json({
      content: html,
      frontmatter,
      meta: {
        path: data.path,
        sha: data.sha,
        size: data.size,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[GitHub Content API]", error);

    return NextResponse.json(
      {
        error: "Failed to fetch GitHub content",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
