import { describe, it, expect, vi, beforeEach } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkSnippet from "../src/index.js";
import fs from "fs/promises";
import path from "path";

vi.mock("fs/promises");

describe("remarkSnippet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const processMarkdown = async (markdown: string, options = {}) => {
    const file = await unified()
      .use(remarkParse)
      .use(remarkSnippet, options)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(markdown);
    return file.toString();
  };

  it("should transform <Snippet> into a component with code", async () => {
    const mockCode = "const foo = 'bar';";
    vi.mocked(fs.readFile).mockResolvedValue(mockCode);

    const markdown = `<Snippet src="example.ts" />`;
    const result = await processMarkdown(markdown);

    expect(fs.readFile).toHaveBeenCalledWith(
      expect.stringContaining("example.ts"),
      "utf-8",
    );
    expect(result).toContain("rawContent={\"const foo = 'bar';\"}");
    expect(result).toContain('src="example.ts"');
    expect(result).toContain("code={");
  });

  it("should respect baseRepoUrl option", async () => {
    vi.mocked(fs.readFile).mockResolvedValue("code");
    const markdown = `<Snippet src="example.ts" />`;
    const result = await processMarkdown(markdown, {
      baseRepoUrl: "https://github.com/custom/repo/blob/main/",
    });

    expect(result).toContain(
      'githubUrl="https://github.com/custom/repo/blob/main/',
    );
  });

  it("should enforce kebab-case filenames", async () => {
    const markdown = `<Snippet src="InvalidName.ts" />`;
    await expect(processMarkdown(markdown)).rejects.toThrow(
      /Invalid snippet filename/,
    );
  });

  it("should extract regions", async () => {
    const mockCode = `
import foo
// [START region1]
const x = 1;
// [END region1]
const y = 2;
`;
    vi.mocked(fs.readFile).mockResolvedValue(mockCode);

    const markdown = `<Snippet src="example.ts" region="region1" />`;
    const result = await processMarkdown(markdown);

    expect(result).toContain('rawContent={"const x = 1;"}');
    expect(result).not.toContain("const y = 2");
  });

  it("should handle missing files gracefully", async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error("File not found"));

    const markdown = `<Snippet src="missing.ts" />`;
    await expect(processMarkdown(markdown)).rejects.toThrow("File not found");
  });
});
