import { visit } from "unist-util-visit";
import fs from "fs/promises";
import path from "path";

import { codeToHtml } from "shiki";

import { EXT_TO_LANG } from "../snippet.constants.ts";

const theme = "vitesse-light";

const remarkSnippet = () => {
  return async (tree: any, vfile: any) => {
    // Attempt to get the file path
    // @ts-ignore - vfile type might miss history in some versions or specific setups
    const filePathFromVFile = vfile.path || (vfile.history && vfile.history[0]);

    interface NodeToProcess {
      node: any; // Using any for html node as it's specific to remark-html/hast
      index: number;
      parent: any;
    }

    const nodesToProcess: NodeToProcess[] = [];

    visit(tree, "html", (node: any, index: number | undefined, parent: any) => {
      if (typeof node.value === "string" && node.value.startsWith("<Snippet")) {
        // Ensure index is defined before pushing needed?
        // visit guarantees index is number usually, but type says undefined
        if (typeof index === "number") {
          nodesToProcess.push({ node, index, parent });
        }
      }
    });

    await Promise.all(
      nodesToProcess.map(async ({ node }) => {
        const srcMatch = node.value.match(/src="([^"]+)"/);
        const descriptionMatch = node.value.match(/description="([^"]+)"/);
        const regionMatch = node.value.match(/region="([^"]+)"/);

        if (srcMatch) {
          const src = srcMatch[1];
          const description = descriptionMatch ? descriptionMatch[1] : "";
          const region = regionMatch ? regionMatch[1] : null;

          let filePath: string;

          if (path.isAbsolute(src)) {
            // Absolute path from project root (e.g. /src/lib/...)
            filePath = path.resolve(process.cwd(), "." + src);
          } else if (filePathFromVFile) {
            // Relative to the markdown file
            filePath = path.resolve(path.dirname(filePathFromVFile), src);
          } else {
            // Fallback: assume relative to src/content/posts (common case)
            // or try to match from root if it looks like a source file
            filePath = path.resolve(process.cwd(), "src/content/posts", src);
          }

          // Enforce kebab-case filename
          const filename = path.basename(filePath);
          const kebabCaseRegex = /^[a-z0-9.-]+$/;
          if (!kebabCaseRegex.test(filename)) {
            throw new Error(
              `Invalid snippet filename: "${filename}". Snippet filenames must be strictly kebab-case (lowercase, numbers, dashes, and dots only). Found in ${filePathFromVFile || "unknown file"}.`,
            );
          }

          let code = await fs.readFile(filePath, "utf-8");

          if (region) {
            const lines = code.split("\n");
            const startMarker = `[START ${region}]`;
            const endMarker = `[END ${region}]`;

            let startIndex = -1;
            let endIndex = -1;

            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes(startMarker)) {
                startIndex = i;
              }
              if (lines[i].includes(endMarker)) {
                endIndex = i;
              }
            }

            if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
              // Extract lines between markers (exclusive of markers, though we filter them anyway)
              code = lines.slice(startIndex + 1, endIndex).join("\n");

              // Adjust indentation if needed (simple dedent based on first line)
              // This is optional but good for display
              const firstLine = code.split("\n")[0];
              if (firstLine) {
                const match = firstLine.match(/^\s+/);
                if (match) {
                  const indent = match[0];
                  code = code
                    .split("\n")
                    .map((line) =>
                      line.startsWith(indent)
                        ? line.slice(indent.length)
                        : line,
                    )
                    .join("\n");
                }
              }
            } else {
              console.warn(`Region ${region} not found or invalid in ${src}`);
            }
          }

          // Remove all region tags (nested or otherwise)
          // Matches: // [START ...] or # [START ...] or just [START ...]
          code = code
            .split("\n")
            .filter((line) => !line.match(/\[(START|END) [a-zA-Z0-9_]+\]/))
            .join("\n");

          let ext = path.extname(src).slice(1);

          console.log(`Snippet processing: ${src}, ext: ${ext}`);
          let lang = ext;

          if (EXT_TO_LANG[ext]) {
            lang = EXT_TO_LANG[ext];
          }

          // Highlight the code
          let html;
          try {
            html = await codeToHtml(code, {
              lang,
              theme,
              transformers: [
                {
                  code(node) {
                    this.addClassToHast(node, `language-${lang}`);
                    this.addClassToHast(node, `relative`);
                  },
                },
              ],
            });
          } catch (highlightError: any) {
            console.warn(
              `Highlighting failed for ${src} with lang ${lang}, falling back to text. Error: ${highlightError.message}`,
            );
            html = await codeToHtml(code, {
              lang: "text",
              theme,
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

          // Calculate GitHub URL (assuming monorepo structure apps/site)
          const relativePath = path.relative(process.cwd(), filePath);
          const githubUrl = `https://github.com/jpoehnelt/blog/blob/main/apps/site/${relativePath}`;

          // Replace the node with the updated component
          // We use JSON.stringify for the html to safely embed it as a prop
          node.value = `<Snippet src="${src}" description="${description}" githubUrl="${githubUrl}" rawContent={${JSON.stringify(code)}} code={${JSON.stringify(html)}} />`;
        }
      }),
    );
  };
};

export default remarkSnippet;
