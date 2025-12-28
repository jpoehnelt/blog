import fs from "fs/promises";
import path from "path";
import { glob } from "glob";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { createHighlighter } from "shiki";
import matter from "gray-matter";
import {
  EXT_TO_LANG,
  SHIKI_THEMES,
  SHIKI_LANGS,
} from "@jpoehnelt/remark-snippet";

// Helper to resolve snippet path (logic mirroring remark-snippet.js)
function resolveSnippetPath(src: string, markdownFilePath: string): string {
  let resolvedPath: string;
  if (path.isAbsolute(src)) {
    // If absolute, treat as relative to CWD (project root) to avoid access to system root
    resolvedPath = path.resolve(process.cwd(), "." + src);
  } else if (markdownFilePath) {
    // Relative to the markdown file
    resolvedPath = path.resolve(path.dirname(markdownFilePath), src);
  } else {
    // Fallback
    resolvedPath = path.resolve(process.cwd(), "src/content/posts", src);
  }

  // Security check: Ensure the path is within the project root
  const relative = path.relative(process.cwd(), resolvedPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(
      `Security Error: Attempted to access file outside project root: ${resolvedPath} (derived from ${src})`
    );
  }

  return resolvedPath;
}

export interface SnippetEntry {
  postTitle: string;
  postSlug: string;
  src: string;
  displaySrc: string;
  description: string;
  region: string | null;
  githubUrl: string;
  rawContent: string;
  code: string;
}

export async function generateSnippets() {
  const postsDir = path.resolve(process.cwd(), "src/content/posts");
  const markdownFiles = await glob(`${postsDir}/*.md`);

  const snippets: SnippetEntry[] = [];

  // Initialize highlighter
  const highlighter = await createHighlighter({
    themes: SHIKI_THEMES,
    langs: SHIKI_LANGS,
  });

  for (const file of markdownFiles) {
    const content = await fs.readFile(file, "utf-8");
    const { data, content: markdownBody } = matter(content);

    // Parse AST to find snippets
    const processor = unified().use(remarkParse);
    const tree = processor.parse(markdownBody);

    interface FileSnippet {
      src: string;
      description: string;
      region: string | null;
      node: any;
    }

    const fileSnippets: FileSnippet[] = [];

    visit(tree, "html", (node: any) => {
      const isSnippet = node.value.match(/<Snippet\s/);
      if (!isSnippet) return;

      const srcMatch = node.value.match(/src="([^"]+)"/);
      const descriptionMatch = node.value.match(/description="([^"]+)"/);
      const regionMatch = node.value.match(/region="([^"]+)"/);

      if (srcMatch) {
        fileSnippets.push({
          src: srcMatch[1],
          description: descriptionMatch ? descriptionMatch[1] : "",
          region: regionMatch ? regionMatch[1] : null,
          node,
        });
      }
    });

    for (const snippet of fileSnippets) {
      try {
        const filePath = resolveSnippetPath(snippet.src, file);
        let code = await fs.readFile(filePath, "utf-8");
        const filename = path.basename(filePath);

        // Region extraction
        if (snippet.region) {
          const lines = code.split("\n");
          const startMarker = `[START ${snippet.region}]`;
          const endMarker = `[END ${snippet.region}]`;
          let startIndex = -1;
          let endIndex = -1;

          startIndex = lines.findIndex((line) => line.includes(startMarker));
          if (startIndex !== -1) {
            endIndex = lines.findIndex(
              (line, i) => i > startIndex && line.includes(endMarker),
            );
          }

          if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            code = lines.slice(startIndex + 1, endIndex).join("\n");
            // Dedent
            const firstLine = code.split("\n")[0];
            if (firstLine) {
              const match = firstLine.match(/^\s+/);
              if (match) {
                const indent = match[0];
                code = code
                  .split("\n")
                  .map((line) =>
                    line.startsWith(indent) ? line.slice(indent.length) : line,
                  )
                  .join("\n");
              }
            }
          }
        }

        // Remove region markers
        code = code
          .split("\n")
          .filter((line) => !line.match(/\[(START|END) [a-zA-Z0-9_]+\]/))
          .join("\n");

        // Determine language
        let ext = path.extname(filePath).slice(1).toLowerCase();
        let lang = EXT_TO_LANG[ext] || ext;

        // Highlight
        let html;
        try {
          html = highlighter.codeToHtml(code, {
            lang,
            theme: "vitesse-light",
            transformers: [
              {
                code(node) {
                  this.addClassToHast(node, `language-${lang}`);
                  this.addClassToHast(node, `relative`);
                },
              },
            ],
          });
        } catch (e) {
          html = highlighter.codeToHtml(code, {
            lang: "text",
            theme: "vitesse-light",
            transformers: [
              {
                code(node) {
                  this.addClassToHast(node, `language-text`);
                  this.addClassToHast(node, `relative`);
                },
              },
            ],
          });
        }

        // GitHub URL
        const relativePath = path.relative(process.cwd(), filePath);
        const githubUrl = `https://github.com/jpoehnelt/blog/blob/main/apps/site/${relativePath}`;

        snippets.push({
          postTitle: data.title,
          postSlug: path.basename(file, ".md"),
          src: snippet.src, // original src from markdown
          displaySrc: filename, // simple filename for display
          description: snippet.description,
          region: snippet.region,
          githubUrl,
          rawContent: code,
          code: html,
        });
      } catch (err: any) {
        console.warn(
          `Failed to process snippet ${snippet.src} in ${file}: ${err.message}`,
        );
      }
    }
  }

  const outputPath = path.resolve(process.cwd(), "src/lib/data/snippets.json");
  await fs.writeFile(outputPath, JSON.stringify(snippets, null, 2));

  console.log(`Generated ${snippets.length} snippets to ${outputPath}`);
  return snippets;
}
