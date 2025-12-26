import type { PostData, SyndicateOptions, SyndicationStatus } from "./types.js";
import ky, { type KyInstance } from "ky";

export abstract class Platform {
  protected client: KyInstance;

  constructor(
    protected name: string,
    protected options: SyndicateOptions,
  ) {
    this.client = ky.create({
      timeout: 60000,
      retry: {
        limit: 3,
        methods: ["get", "put", "head", "delete", "options", "trace", "post"],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
        afterStatusCodes: [413, 429, 503],
      },
    });
  }

  abstract init(): Promise<void>;
  abstract syndicate(post: PostData): Promise<SyndicationStatus | null>;
  abstract getStatus(post: PostData): Promise<SyndicationStatus | null>;
  abstract transform(content: string): Promise<string>;

  protected log(msg: string) {
    console.log(`[${this.name}] ${msg}`);
  }

  protected get shouldPublish() {
    return !this.options.dryRun;
  }
}
