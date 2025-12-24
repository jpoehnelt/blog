import type { MarkdownTransformContext } from "@slidev/types";
import { defineTransformersSetup } from "@slidev/types";

function getValueByPath(obj: any, path: string): any {
  if (!obj) return undefined;

  const keys: string[] = [];
  let i = 0;
  const len = path.length;

  while (i < len) {
    // Skip dot
    if (path[i] === '.') {
      i++;
      continue;
    }

    if (path[i] === '[') {
      // Bracket notation
      i++; // consume [

      // consume whitespace
      while(i < len && /\s/.test(path[i])) i++;

      if (i >= len) break; // malformed

      let key = '';
      if (path[i] === '\'' || path[i] === '"') {
        // Quoted string
        const quote = path[i];
        i++; // consume opening quote

        while (i < len) {
           if (path[i] === '\\') {
             if (i + 1 < len) {
                key += path[i+1];
                i += 2;
             } else {
                key += '\\';
                i++;
             }
           } else if (path[i] === quote) {
             i++; // consume closing quote
             break;
           } else {
             key += path[i];
             i++;
           }
        }

        // consume whitespace after quote until ]
        while(i < len && /\s/.test(path[i])) i++;
        if (i < len && path[i] === ']') i++; // consume ]

      } else {
        // Unquoted key (number or variable-like)
        while (i < len && path[i] !== ']') {
           key += path[i];
           i++;
        }
        key = key.trim();
        if (i < len && path[i] === ']') i++; // consume ]
      }
      keys.push(key);
    } else {
      // Dot notation key
      let key = '';
      while (i < len && path[i] !== '.' && path[i] !== '[') {
        key += path[i];
        i++;
      }
      if (key.length > 0) {
        keys.push(key);
      }
    }
  }

  // Traverse
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
