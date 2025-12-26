import { Platform } from "./platform.js";
import type { PostData, SyndicateOptions, SyndicationStatus } from "./types.js";

export class MediumPlatform extends Platform {
  private token: string;
  private USER_AGENT =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
  private USER =
    "196a743bbd33214584e913c2e8c8633a99ab05b6efac5416f4b5ab57b6e065d99";

  constructor(token: string, options: SyndicateOptions) {
    super("Medium", options);
    this.token = token;
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

    const finalContent = this.transform(content);

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

  transform(content: string): string {
    const transformedContent = this.baseTransform(content);
    return this.transformTablesToLists(transformedContent);
  }

  private transformTablesToLists(content: string): string {
    return content.replace(
      /\|(.+)\|\n\|([-:| ]+)\|\n((?:\|.*\|\n)+)/g,
      (match, header, separator, body) => {
        try {
          const headers = header
            .split("|")
            .map((h: string) => h.trim())
            .filter((h: string) => h !== "");
          const rows = body
            .trim()
            .split("\n")
            .map((row: string) =>
              row
                .split("|")
                .map((c: string) => c.trim())
                .filter((c: string) => c !== ""),
            );

          let listOutput = "";
          rows.forEach((row: string[]) => {
            row.forEach((cell: string, index: number) => {
              const label = headers[index] || "Column " + (index + 1);
              listOutput += `**${label}**: ${cell}  \n`;
            });
            listOutput += "\n---\n\n"; // Separator between rows
          });

          return listOutput;
        } catch (e) {
          return match; // Fallback
        }
      },
    );
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
