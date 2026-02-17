import { visit } from "unist-util-visit";
import fs from "fs/promises";
import path from "path";
import { codeToHtml } from "shiki";
import { EXT_TO_LANG } from "./constants.js";

export * from "./constants.js";

const theme = "vitesse-light";

/**
 * Options for the remarkSnippet plugin
 */
export interface RemarkSnippetOptions {
  /**
   * Base URL for the GitHub repository to link snippets to.
   * Example: "https://github.com/jpoehnelt/blog/blob/main/apps/site/"
   */
  baseRepoUrl?: string;
}

const remarkSnippet = (options: RemarkSnippetOptions = {}) => {
  return async (tree: any, vfile: any) => {
    // @ts-ignore
    const filePathFromVFile = vfile.path || (vfile.history && vfile.history[0]);

    interface NodeToProcess {
      node: any; // Using any for html node as it's specific to remark-html/hast
      index: number;
      parent: any;
    }

    const nodesToProcess: NodeToProcess[] = [];

    visit(tree, "html", (node: any, index: number | undefined, parent: any) => {
      if (typeof node.value === "string" && node.value.startsWith("<Snippet")) {
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

            startIndex = lines.findIndex((line) => line.includes(startMarker));
            if (startIndex !== -1) {
              endIndex = lines.findIndex(
                (line, i) => i > startIndex && line.includes(endMarker),
              );
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
          let lang = EXT_TO_LANG[ext] || ext;

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

          const relativePath = path.relative(process.cwd(), filePath);

          let githubUrl: string;
          if (options.baseRepoUrl) {
            // Ensure trailing slash
            const base = options.baseRepoUrl.endsWith("/")
              ? options.baseRepoUrl
              : options.baseRepoUrl + "/";
            githubUrl = base + relativePath;
          } else {
            githubUrl = `https://github.com/jpoehnelt/blog/blob/main/apps/site/${relativePath}`;
          }

          node.value = `<Snippet src="${src}" description="${description}" githubUrl="${githubUrl}" rawContent={${JSON.stringify(code)}} code={${JSON.stringify(html)}} />`;
        }
      }),
    );

    // Process <SnippetMerged> tags
    const mergedNodesToProcess: NodeToProcess[] = [];

    visit(tree, "html", (node: any, index: number | undefined, parent: any) => {
      if (
        typeof node.value === "string" &&
        node.value.startsWith("<SnippetMerged")
      ) {
        if (typeof index === "number") {
          mergedNodesToProcess.push({ node, index, parent });
        }
      }
    });

    await Promise.all(
      mergedNodesToProcess.map(async ({ node }) => {
        const srcsMatch = node.value.match(/srcs="([^"]+)"/);
        const descriptionMatch = node.value.match(/description="([^"]+)"/);
        const separatorMatch = node.value.match(/separator="([^"]+)"/);

        if (srcsMatch) {
          const srcs = srcsMatch[1];
          const srcList = srcs.split(",").map((s: string) => s.trim());
          const description = descriptionMatch ? descriptionMatch[1] : "";
          const separator = separatorMatch
            ? separatorMatch[1].replace(/\\n/g, "\n")
            : "\n";

          const allCode: string[] = [];
          const allGithubUrls: string[] = [];

          for (const src of srcList) {
            let filePath: string;

            if (path.isAbsolute(src)) {
              filePath = path.resolve(process.cwd(), "." + src);
            } else if (filePathFromVFile) {
              filePath = path.resolve(path.dirname(filePathFromVFile), src);
            } else {
              filePath = path.resolve(process.cwd(), "src/content/posts", src);
            }

            const filename = path.basename(filePath);
            const kebabCaseRegex = /^[a-z0-9.-]+$/;
            if (!kebabCaseRegex.test(filename)) {
              throw new Error(
                `Invalid snippet filename: "${filename}". Snippet filenames must be strictly kebab-case.`,
              );
            }

            let code = await fs.readFile(filePath, "utf-8");

            // Remove region markers
            code = code
              .split("\n")
              .filter((line) => !line.match(/\[(START|END) [a-zA-Z0-9_]+\]/))
              .join("\n");

            allCode.push(code);

            const relativePath = path.relative(process.cwd(), filePath);
            if (options.baseRepoUrl) {
              const base = options.baseRepoUrl.endsWith("/")
                ? options.baseRepoUrl
                : options.baseRepoUrl + "/";
              allGithubUrls.push(base + relativePath);
            } else {
              allGithubUrls.push(
                `https://github.com/jpoehnelt/blog/blob/main/apps/site/${relativePath}`,
              );
            }
          }

          const mergedCode = allCode.join(separator);
          const ext = path.extname(srcList[0]).slice(1);
          const lang = EXT_TO_LANG[ext] || ext;

          let html;
          try {
            html = await codeToHtml(mergedCode, {
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
              `Highlighting failed for merged snippet, falling back to text. Error: ${highlightError.message}`,
            );
            html = await codeToHtml(mergedCode, {
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

          node.value = `<SnippetMerged srcs="${srcs}" description="${description}" githubUrls="${allGithubUrls.join(",")}" rawContent={${JSON.stringify(mergedCode)}} code={${JSON.stringify(html)}} />`;
        }
      }),
    );
  };
};

export default remarkSnippet;
