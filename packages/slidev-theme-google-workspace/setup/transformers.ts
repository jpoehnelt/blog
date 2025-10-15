import type { MarkdownTransformContext } from "@slidev/types";
import { defineTransformersSetup } from "@slidev/types";

function getValueByPath(obj: Object, path: string): any {
  const brackets: Record<string, string> = {};

  // replace brackets with placeholders using dot notation
  const pathWithPlaceholders = path
    .trim()
    // TODO does not cover all cases
    .replace(/\[['"]?(.*?)['"]?\]/g, (_, match, index) => {
      const placeholder = `__BRACKET_${index}__`;
      brackets[placeholder] = match;
      return `.${placeholder}`;
    });

  const keys = pathWithPlaceholders.split(".");
  let current: any = obj;

  for (const key of keys) {
    if (current && typeof current === "object") {
      current = current[key] ?? current[brackets[key]];
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
