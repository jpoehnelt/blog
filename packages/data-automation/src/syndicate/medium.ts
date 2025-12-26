import { Platform } from "./platform.js";
import { GistManager } from "./gist.js";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import {
  remarkRewriteImages,
  remarkTablesToLists,
  remarkGistCodeBlocks,
} from "./plugins.js";
import type { PostData, SyndicateOptions, SyndicationStatus } from "./types.js";

export class MediumPlatform extends Platform {
  private token: string;
  private gistManager?: GistManager;
  private USER_AGENT =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
  private USER =
    "196a743bbd33214584e913c2e8c8633a99ab05b6efac5416f4b5ab57b6e065d99";

  constructor(token: string, options: SyndicateOptions, githubToken?: string) {
    super("Medium", options);
    this.token = token;
    if (githubToken) {
      this.gistManager = new GistManager(githubToken);
    }
  }

  async init(): Promise<void> {}

  async getStatus(post: PostData): Promise<SyndicationStatus | null> {
    const { frontmatter } = post;
    const medium = frontmatter.medium || {};

    if (medium.link) {
      const res = await this.client.get(medium.link, {
        headers: {
          "User-Agent": this.USER_AGENT,
        },
        throwHttpErrors: false,
      });

      if (res.ok) {
        if (
          res.url.includes("medium.com/m/signin") ||
          res.url.includes("isDraft=1") ||
          res.url.includes("operation=login")
        ) {
          return {
            id: medium.id,
            link: medium.link,
            status: "draft",
          };
        }

        if (medium.status !== "published") {
          this.log(`Detected published status for "${frontmatter.title}"`);
          return {
            id: medium.id,
            link: res.url,
            status: "published",
          };
        }
      }
    }
    return null;
  }

  async syndicate(post: PostData): Promise<SyndicationStatus | null> {
    const statusUpdate = await this.getStatus(post);
    if (this.options.mode === "pull") return statusUpdate;

    const currentMediumState = statusUpdate || post.frontmatter.medium || {};
    const { content, canonicalUrl } = post;

    // Check if we need to publish/update
    if (currentMediumState.link) {
      if (currentMediumState.status === "published") {
        this.log(
          `Skipping "${post.frontmatter.title}" (Published: ${currentMediumState.link})`,
        );
        return statusUpdate;
      }

      if (!this.options.force) {
        this.log(
          `Skipping "${post.frontmatter.title}" (Draft: ${currentMediumState.link})`,
        );
        return statusUpdate;
      }

      this.log(
        `Re-syndicating draft "${post.frontmatter.title}" (Creating new)...`,
      );
    }

    this.log(`Syndicating "${post.frontmatter.title}"...`);
    if (!this.shouldPublish) return statusUpdate;

    const finalContent = await this.transform(
      content,
      post.frontmatter.title,
      canonicalUrl,
    );

    try {
      const payload = {
        title: post.frontmatter.title,
        contentFormat: "markdown",
        content: finalContent,
        tags: (post.frontmatter.tags || []).slice(0, 5),
        canonicalUrl,
        publishStatus: "draft",
      };

      const res: any = await this.fetch(
        `/users/${this.USER}/posts`,
        "POST",
        payload,
      );
      const data = res.data;

      this.log(`Published: ${data.url}`);

      return {
        id: data.id,
        link: data.url,
        status: data.publishStatus,
      };
    } catch (e: any) {
      console.error(`Medium Error: ${e.message}`);
      return statusUpdate;
    }
  }

  async transform(
    content: string,
    title = "Untitled",
    canonicalUrl = "",
  ): Promise<string> {
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRewriteImages, { baseUrl: this.options.baseUrl })
      .use(remarkTablesToLists)
      .use(remarkGistCodeBlocks, {
        gistManager: this.gistManager,
        title,
        canonicalUrl,
      })
      .use(remarkStringify)
      .process(content);
    return String(file);
  }

  private async fetch(endpoint: string, method = "GET", body?: any) {
    const res = await this.client(`https://api.medium.com/v1${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      json: body,
      throwHttpErrors: false,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  }
}
