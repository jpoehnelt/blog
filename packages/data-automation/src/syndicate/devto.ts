import { Platform } from "./platform.js";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { remarkRewriteImages } from "./plugins.js";
import type { PostData, SyndicateOptions, SyndicationStatus } from "./types.js";

export class DevToPlatform extends Platform {
  private cache: any[] = [];
  private apiKey: string;

  constructor(apiKey: string, options: SyndicateOptions) {
    super("Dev.to", options);
    this.apiKey = apiKey;
  }

  async init() {
    this.log("Fetching existing articles...");
    if (this.options.dryRun) return;

    let page = 1;
    while (true) {
      const data = await this.fetch(
        `/articles/me/all?page=${page}&per_page=1000`,
      );
      if (!data || data.length === 0) break;
      this.cache.push(...data);
      page++;
    }
  }

  async getStatus(post: PostData): Promise<SyndicationStatus | null> {
    const { frontmatter, canonicalUrl } = post;
    const devtoId = frontmatter.devto?.id;
    const existing = devtoId
      ? this.cache.find((a) => a.id === devtoId)
      : this.cache.find((a) => a.canonical_url === canonicalUrl);

    if (existing) {
      const status = existing.published ? "published" : "draft";
      if (
        frontmatter.devto?.id !== existing.id ||
        frontmatter.devto?.status !== status
      ) {
        this.log(`Syncing local metadata for "${frontmatter.title}"`);
        // Return status update
        return {
          id: existing.id,
          link: existing.url,
          status,
        };
      }
    }
    return null;
  }

  async syndicate(post: PostData): Promise<SyndicationStatus | null> {
    // Sync Metadata
    const statusUpdate = await this.getStatus(post);
    if (this.options.mode === "pull") return statusUpdate;

    const currentDevToState = statusUpdate || post.frontmatter.devto || {};
    const { content, canonicalUrl } = post;

    // Check Exists (using synced frontmatter or original)
    if (currentDevToState.id) {
      // It exists.
      const existingUrl = currentDevToState.link;
      const isPublished = currentDevToState.status === "published";

      // Force Update Logic
      if (this.options.force && !isPublished) {
        this.log(`Force updating draft "${post.frontmatter.title}"...`);
        if (!this.shouldPublish) return statusUpdate;

        if (!this.shouldPublish) return statusUpdate;

        const transformedContent = await this.transform(content);

        try {
          const payload = {
            article: {
              title: post.frontmatter.title,
              body_markdown: transformedContent,
              tags: (post.frontmatter.tags || [])
                .slice(0, 4)
                .map((t: string) => t.toLowerCase().replace(/\s/g, "")),
              description: post.frontmatter.description,
            },
          };

          const data = await this.fetch(
            `/articles/${currentDevToState.id}`,
            "PUT",
            payload,
          );
          this.log(`✅ Updated draft: ${data.url}`);

          return {
            id: data.id,
            link: data.url,
            status: "draft",
          };
        } catch (e: any) {
          console.error(`Dev.to Update Error: ${e.message}`);
          return statusUpdate;
        }
      }

      this.log(`Skipping "${post.frontmatter.title}" (Exists: ${existingUrl})`);
      return statusUpdate;
    }

    // Create New
    this.log(`Syndicating "${post.frontmatter.title}"...`);
    if (!this.shouldPublish) return statusUpdate;

    const transformedContent = this.transform(content);

    try {
      const payload = {
        article: {
          title: post.frontmatter.title,
          body_markdown: transformedContent, // Use transformed
          published: false,
          canonical_url: canonicalUrl,
          tags: (post.frontmatter.tags || [])
            .slice(0, 4)
            .map((t: string) => t.toLowerCase().replace(/\s/g, "")),
          description: post.frontmatter.description,
        },
      };

      const data = await this.fetch("/articles", "POST", payload);
      this.cache.push(data); // Update cache
      return {
        id: data.id,
        link: data.url,
        status: "draft",
      };
    } catch (e: any) {
      console.error(`Dev.to Error: ${e.message}`);
      return statusUpdate;
    }
  }

  private async fetch(endpoint: string, method = "GET", body?: any) {
    const res = await this.client(`https://dev.to/api${endpoint}`, {
      method,
      headers: { "api-key": this.apiKey, "Content-Type": "application/json" },
      json: body,
      throwHttpErrors: false,
    });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
    return res.json<any>();
  }

  async transform(content: string): Promise<string> {
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRewriteImages, { baseUrl: this.options.baseUrl })
      .use(remarkStringify)
      .process(content);
    return String(file);
  }
}
