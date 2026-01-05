import type { MarkdownTransformContext } from "@slidev/types";
import { defineTransformersSetup } from "@slidev/types";

function getValueByPath(obj: any, path: string): any {
  path = path.trim();
  const keys: string[] = [];
  let currentKey = "";
  let inBracket = false;
  let quoteChar: string | null = null;
  let escape = false;

  for (let i = 0; i < path.length; i++) {
    const char = path[i];

    if (inBracket) {
      if (quoteChar) {
        if (escape) {
          currentKey += char;
          escape = false;
        } else if (char === "\\") {
          escape = true;
        } else if (char === quoteChar) {
          quoteChar = null;
        } else {
          currentKey += char;
        }
      } else {
        if (char === "]") {
          keys.push(currentKey);
          currentKey = "";
          inBracket = false;
        } else if (char === '"' || char === "'") {
          quoteChar = char;
        } else if (/\s/.test(char)) {
          // ignore whitespace outside quotes in brackets
        } else {
          currentKey += char;
        }
      }
    } else {
      if (char === ".") {
        if (currentKey) {
          keys.push(currentKey);
          currentKey = "";
        }
      } else if (char === "[") {
        if (currentKey) {
          keys.push(currentKey);
          currentKey = "";
        }
        inBracket = true;
      } else {
        currentKey += char;
      }
    }
  }

  if (currentKey) {
    keys.push(currentKey);
  }

  if (inBracket || quoteChar !== null || escape) {
    return undefined;
  }

  let current: any = obj;

  for (const key of keys) {
    if (current && typeof current === "object") {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return current;
}

function transformFrontmatter(ctx: MarkdownTransformContext) {
  ctx.s.replace(
    /^```([^\n]*)?\n([\s\S]+?)\n```/gm,
    (_, annotations = "", code = "") => {
      code = code.replace(
        /\{\{ *\$frontmatter\.(.*) *\}\}/g,
        (_: never, key: string) => {
          return getValueByPath(ctx.slide.source.frontmatter, key);
        },
      );

      return `\`\`\`${annotations}\n${code}\n\`\`\``;
    },
  );
}

export default defineTransformersSetup(() => {
  return {
    pre: [],
    preCodeblock: [transformFrontmatter],
    postCodeblock: [],
    post: [],
  };
});
