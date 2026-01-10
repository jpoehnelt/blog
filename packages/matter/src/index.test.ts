import { describe, it, expect } from "vitest";
import { parse, stringify } from "./index";

describe("matter", () => {
  describe("parse", () => {
    it("should parse valid frontmatter", () => {
      const content = `---
title: "Hello"
---
Content`;
      const result = parse(content);
      expect(result.data).toEqual({ title: "Hello" });
      expect(result.content.trim()).toBe("Content");
    });

    it("should return empty data if no leading separator", () => {
      const content = `Title: Hello
---
Content`;
      const result = parse(content);
      expect(result.data).toEqual({});
      expect(result.content).toBe(content);
    });

    it("should handle empty content", () => {
      const result = parse("");
      expect(result.data).toEqual({});
      expect(result.content).toBe("");
    });
  });

  describe("stringify", () => {
    it("should stringify with double quotes", () => {
      const data = { title: "Hello World" };
      const content = "Content";
      const result = stringify(content, data);
      expect(result).toContain('title: "Hello World"');
    });

    it("should preserve content", () => {
      const data = { foo: "bar" };
      const content = "Just content";
      const result = stringify(content, data);
      expect(result).toContain(content);
      expect(result).toContain('foo: "bar"');
    });
  });
});
