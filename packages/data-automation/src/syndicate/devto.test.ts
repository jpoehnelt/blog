import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DevToPlatform } from "./devto.js";

const mockKy = vi.fn() as any;
mockKy.extend = vi.fn(() => mockKy);

vi.mock("ky", () => ({
  default: {
    create: vi.fn(() => mockKy),
  },
}));

// Mock CONFIG - Not needed for class
// vi.mock('./config.js', ...);

describe("DevToPlatform", () => {
  let platform: DevToPlatform;

  beforeEach(() => {
    vi.clearAllMocks();
    platform = new DevToPlatform("test-api-key", {
      dryRun: false,
      mode: "sync",
      baseUrl: "https://example.com/posts",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize and fetch existing articles", async () => {
    const mockArticles = [{ id: 123, url: "https://dev.to/test" }];

    // Mock response for call
    mockKy
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockArticles,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    await platform.init();

    expect(mockKy).toHaveBeenCalledWith(
      expect.stringContaining("https://dev.to/api/articles/me/all"),
      expect.objectContaining({
        headers: expect.objectContaining({ "api-key": "test-api-key" }),
      }),
    );
  });

  it("should syndicate a new article", async () => {
    // Mock init fetch (empty)
    mockKy.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    await platform.init();

    // Mock create fetch using mockImplementation to return different values based on calls or just strict ordering
    mockKy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 456, url: "https://dev.to/new" }),
    });

    const result = await platform.syndicate({
      slug: "test-slug",
      content: "Test content",
      frontmatter: { title: "Test Title" },
      canonicalUrl: "https://example.com/posts/test-slug",
    });

    expect(result).not.toBeNull();
    // Check status object
    expect(result).toEqual({
      id: 456,
      link: "https://dev.to/new",
      status: "draft",
    });

    expect(mockKy).toHaveBeenCalledWith(
      "https://dev.to/api/articles",
      expect.objectContaining({
        method: "POST",
        json: expect.objectContaining({
          article: expect.objectContaining({ title: "Test Title" }),
        }),
      }),
    );
  });

  it("should update an existing article if force is true and status is draft", async () => {
    platform = new DevToPlatform("test-api-key", {
      dryRun: false,
      mode: "sync",
      force: true,
      baseUrl: "https://example.com/posts",
    });

    // Mock update fetch
    mockKy.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 123, url: "https://dev.to/updated" }),
    });

    const result = await platform.syndicate({
      slug: "test-slug",
      content: "Updated content",
      frontmatter: {
        title: "Test Title",
        devto: { id: 123, link: "https://dev.to/old", status: "draft" },
      },
      canonicalUrl: "https://example.com/posts/test-slug",
    });

    expect(result).not.toBeNull();
    // Check status object
    expect(result).toEqual({
      id: 123,
      link: "https://dev.to/updated",
      status: "draft",
    });

    expect(mockKy).toHaveBeenCalledWith(
      "https://dev.to/api/articles/123",
      expect.objectContaining({
        method: "PUT",
        json: expect.objectContaining({
          article: expect.objectContaining({
            body_markdown: expect.any(String),
          }),
        }),
      }),
    );
  });

  it("should skip existing published article", async () => {
    const result = await platform.syndicate({
      slug: "test-slug",
      content: "Content",
      frontmatter: {
        title: "Test Title",
        devto: {
          id: 123,
          link: "https://dev.to/published",
          status: "published",
        },
      },
      canonicalUrl: "https://example.com/posts/test-slug",
    });

    expect(result).toBeNull();
    expect(mockKy).not.toHaveBeenCalled();
  });
});
