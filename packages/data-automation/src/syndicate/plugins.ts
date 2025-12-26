import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root } from "mdast";
import { GistManager } from "./gist.js";

/**
 * Plugin to rewrite image URLs to absolute URLs based on a baseUrl.
 * Handles markdown images: ![](/path) -> ![](baseUrl/path)
 * Handles HTML images: <img src="/path"> -> <img src="baseUrl/path">
 */
export const remarkRewriteImages: Plugin<[{ baseUrl?: string }], Root> = ({
  baseUrl,
}) => {
  return (tree) => {
    if (!baseUrl) return;
    const cleanBaseUrl = baseUrl.replace(/\/posts$/, "");

    visit(tree, ["image", "html"], (node: any) => {
      if (node.type === "image") {
        if (node.url.startsWith("/")) {
          node.url = `${cleanBaseUrl}${node.url}`;
        }
      } else if (node.type === "html") {
        // Simple regex replace for HTML tags, as we don't want to parse full HTML here if we can avoid it.
        // This matches the previous regex logic but inside the AST.
        node.value = node.value.replace(
          /src="(\/.*?)"/g,
          (match: string, url: string) => `src="${cleanBaseUrl}${url}"`,
        );
      }
    });
  };
};

/**
 * Plugin to transform markdown tables into a list representation.
 * Medium does not support tables, so we convert them to a list format:
 * **Header**: Value
 * **Header**: Value
 * ---
 */
export const remarkTablesToLists: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "table", (node, index, parent) => {
      if (!parent || index === undefined) return;

      const headers = node.children[0].children.map((cell) => {
        // Simplification: assume header cells are simple text for label generation
        return (cell.children[0] as any)?.value || "";
      });

      const listNodes: any[] = [];
      // Skip header row (index 0)
      for (let i = 1; i < node.children.length; i++) {
        const row = node.children[i];

        row.children.forEach((cell, cellIndex) => {
          const header = headers[cellIndex] || `Column ${cellIndex + 1}`;

          // Create "**Header**: " node
          const labelNode = {
            type: "strong",
            children: [{ type: "text", value: header }],
          };

          // Separator ": "
          const separatorNode = { type: "text", value: ": " };

          // Content is the cell's children

          listNodes.push({
            type: "paragraph",
            children: [
              labelNode,
              separatorNode,
              ...cell.children,
              // Medium needs specific formatting, but standard markdown lists are:
              // Header: Value
            ],
          });
        });

        // Add separator between rows if not the last row
        if (i < node.children.length - 1) {
          listNodes.push({ type: "thematicBreak" });
        }
      }

      // Replace table with the list of nodes

      parent.children.splice(index, 1, ...listNodes);
    });
  };
};

/**
 * Plugin to process code blocks, creating Gists via GistManager.
 * Transforms `code` nodes into `link` nodes pointing to the created Gist.
 */
export const remarkGistCodeBlocks: Plugin<
  [{ gistManager?: GistManager; title: string; canonicalUrl: string }],
  Root
> = ({ gistManager, title, canonicalUrl }) => {
  return async (tree) => {
    if (!gistManager) return;

    const promises: (() => Promise<void>)[] = [];

    visit(tree, "code", (node, index, parent) => {
      if (!parent || index === undefined) return;

      const lang = node.lang || "text";
      const filename = `${title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}.${lang}`;
      const description = `Code snippet from ${title} - ${canonicalUrl}`;
      const codeContent = node.value;

      // We can't await inside visit sync, so we collect promises
      promises.push(async () => {
        try {
          const gistUrl = await gistManager.createGist(
            codeContent,
            filename,
            description,
          );

          // Replace code node with a paragraph containing a link to the gist

          const replacementNode = {
            type: "paragraph",
            children: [
              {
                type: "link",
                title: null,
                url: gistUrl,
                children: [{ type: "text", value: gistUrl }],
              },
            ],
          };

          Object.assign(node, replacementNode);
        } catch (e) {
          console.error(`Failed to create gist for ${filename}:`, e);
        }
      });
    });

    await Promise.all(promises.map((p) => p()));
  };
};
