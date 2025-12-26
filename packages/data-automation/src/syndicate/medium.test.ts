import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MediumPlatform } from "./medium.js";

const mockKy = vi.fn() as any;
mockKy.get = vi.fn();
mockKy.extend = vi.fn(() => mockKy);

vi.mock("ky", () => ({
  default: {
    create: vi.fn(() => mockKy),
  },
}));

const mockCreateGist = vi.fn();
vi.mock("./gist.js", () => ({
  GistManager: class {
    createGist = mockCreateGist;
  },
}));

// Mock CONFIG - Not needed for class, but maybe for test setup if used elsewhere?
// The class no longer imports CONFIG.
// vi.mock('./config.js', ...);

describe("MediumPlatform", () => {
  let platform: MediumPlatform;

  beforeEach(() => {
    vi.clearAllMocks();
    platform = new MediumPlatform("test-token", {
      dryRun: false,
      mode: "sync",
      baseUrl: "https://example.com/posts",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should transform tables to lists", async () => {
    // Mock create fetch (syndicate) uses mockKy(...) call directly
    mockKy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: "post-123",
          url: "https://medium.com/post/123",
          publishStatus: "draft",
        },
      }),
    });

    const tableContent = `
| Header 1 | Header 2 |
| -------- | -------- |
| Value 1  | Value 2  |
`;

    const result = await platform.syndicate({
      slug: "test-slug",
      content: tableContent,
      frontmatter: { title: "Test Title" },
      canonicalUrl: "https://example.com/posts/test-slug",
    });

    expect(result).not.toBeNull();
    // Check return value is just the status
    expect(result).toEqual({
      id: "post-123",
      link: "https://medium.com/post/123",
      status: "draft",
    });

    // Check body of the POST request
    expect(mockKy).toHaveBeenCalledWith(
      expect.stringContaining("/posts"),
      expect.objectContaining({
        json: expect.objectContaining({
          content: expect.stringContaining("**Header 1**: Value 1"),
        }),
      }),
    );
  });

  it("should detect published status via URL check", async () => {
    const postData = {
      slug: "test",
      content: "content",
      frontmatter: {
        title: "Test",
        medium: { link: "https://medium.com/p/123", status: "draft" },
      },
      canonicalUrl: "url",
    };

    // Mock fetch for URL check using client.get
    mockKy.get.mockResolvedValueOnce({
      ok: true,
      url: "https://medium.com/p/123",
      status: 200,
    });

    const result = await platform.getStatus(postData as any);
    expect(result).not.toBeNull();
    expect(result?.status).toBe("published");
    expect(mockKy.get).toHaveBeenCalledWith(
      "https://medium.com/p/123",
      expect.anything(),
    );
  });

  it("should detect draft status via URL check (redirect to signin)", async () => {
    const postData = {
      slug: "test",
      content: "content",
      frontmatter: {
        title: "Test",
        medium: {
          id: "123",
          link: "https://medium.com/p/123",
          status: "draft",
        },
      },
      canonicalUrl: "url",
    };

    // Mock ky.get
    mockKy.get.mockResolvedValueOnce({
      ok: true,
      url: "https://medium.com/m/signin?redirect=...",
      status: 200,
    });

    const result = await platform.getStatus(postData as any);
    // Logic changed: if redirected to login, we assume it MAY NOT be published, so we return current draft status
    expect(result).toEqual({
      id: "123",
      link: "https://medium.com/p/123",
      status: "draft",
    });
  });

  it("should replace code blocks with Gists when githubToken is provided", async () => {
    // Re-instantiate with githubToken
    const platformWithGist = new MediumPlatform(
      "test-token",
      {
        dryRun: false,
        mode: "sync",
        baseUrl: "https://example.com/posts",
      },
      "fake-github-token",
    );

    mockKy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: "post-123",
          url: "https://medium.com/post/123",
          publishStatus: "draft",
        },
      }),
    });

    mockCreateGist.mockResolvedValue("https://gist.github.com/123");

    const content = `
Check out this code:

\`\`\`typescript
const a = 1;
\`\`\`

End of post.
    `;

    await platformWithGist.syndicate({
      slug: "test-slug",
      content: content,
      frontmatter: { title: "Test Title" },
      canonicalUrl: "https://example.com/posts/test-slug",
    });

    // Verify GistManager was called
    expect(mockCreateGist).toHaveBeenCalledWith(
      expect.stringContaining("const a = 1;"),
      expect.stringContaining("test-title.typescript"),
      expect.stringContaining("Code snippet from Test Title"),
    );

    // Verify Medium payload contains Gist URL
    const postCall = mockKy.mock.calls.find((call: any[]) =>
      call[0].includes("/posts"),
    );
    const body = postCall[1].json;
    expect(body.content).toContain("https://gist.github.com/123");
    expect(body.content).not.toContain("```typescript");
  });
});
