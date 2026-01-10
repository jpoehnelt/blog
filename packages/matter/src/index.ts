import YAML from "yaml";

/**
 * Stringify content and data to frontmatter.
 * Enforces double quotes for string values in frontmatter.
 */
export function stringify(content: string, data: object): string {
  const yaml = YAML.stringify(data, {
    defaultStringType: "QUOTE_DOUBLE",
    defaultKeyType: "PLAIN",
  });
  return `---\n${yaml}---\n${content}`;
}

export interface GrayMatterFile {
  data: { [key: string]: any };
  content: string;
  orig: string;
  language: string;
  matter: string;
  stringify(content: string): string;
}

/**
 * Parse content with frontmatter.
 * Strictly requires the first line to be the start of the frontmatter separator '---'.
 */
export function parse(content: string): GrayMatterFile {
  if (!content.startsWith("---")) {
    return {
      data: {},
      content: content,
      orig: content,
      language: "",
      matter: "",
      stringify: (content: string) => content,
    };
  }

  // Find the end of the frontmatter
  const end = content.indexOf("\n---", 3);
  if (end === -1) {
    return {
      data: {},
      content: content,
      orig: content,
      language: "",
      matter: "",
      stringify: (content: string) => content,
    };
  }

  const rawMatter = content.slice(3, end);
  const data = YAML.parse(rawMatter) || {};
  const body = content.slice(end + 4).replace(/^\r?\n/, ""); // Remove first newline after ---

  return {
    data,
    content: body,
    orig: content,
    language: "yaml",
    matter: rawMatter,
    stringify: (content: string) => stringify(content, data),
  };
}

export default {
  stringify,
  parse,
};
