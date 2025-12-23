import { visit } from "unist-util-visit";
import fs from "fs/promises";
import path from "path";
import { codeToHtml } from "shiki";

const theme = "vitesse-light";

/** @type {import('unified').Plugin} */
export default function remarkSnippet() {
  console.log("remarkSnippet plugin initialized");
  return async (tree, vfile) => {

    // Attempt to get the file path
    // @ts-ignore
    const filePathFromVFile = vfile.path || vfile.filename || (vfile.history && vfile.history[0]);
    
    /** @type {Array<{node: any, index: number, parent: any}>} */
    const nodesToProcess = [];

    visit(tree, "html", (/** @type {any} */ node, /** @type {number} */ index, parent) => {
      if (node.value.startsWith("<Snippet")) {
        nodesToProcess.push({ node, index, parent });
      }
    });

    await Promise.all(
      nodesToProcess.map(async ({ node }) => {
        const srcMatch = node.value.match(/src="([^"]+)"/);
        const descriptionMatch = node.value.match(/description="([^"]+)"/);

        if (srcMatch) {
          const src = srcMatch[1];
          const description = descriptionMatch ? descriptionMatch[1] : "";
          
          let filePath;
          
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

          try {
            const code = await fs.readFile(filePath, "utf-8");
            const ext = path.extname(src).slice(1);
            
            // Highlight the code
            const html = await codeToHtml(code, {
              lang: ext,
              theme,
              transformers: [
                {
                  code(node) {
                    this.addClassToHast(node, `language-${ext}`);
                    this.addClassToHast(node, `relative`);
                  },
                },
              ],
            });

            // Replace the node with the updated component
            // We use JSON.stringify for the html to safely embed it as a prop
            node.value = `<Snippet src="${src}" description="${description}" code={${JSON.stringify(html)}} />`;
          } catch (e) {
            console.error(`Failed to read or highlight snippet: ${filePath}`, e);
            // Optionally leave it as is or render an error message in place
            // node.value = `<div class="text-red-500">Error loading snippet: ${src}</div>`;
          }
        }
      })
    );
  };
}
