import { Octokit } from "octokit";

export class GistManager {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async createGist(
    content: string,
    filename: string,
    description: string,
  ): Promise<string> {
    const response = await this.octokit.rest.gists.create({
      description,
      public: true,
      files: {
        [filename]: {
          content,
        },
      },
    });

    if (!response.data.html_url) {
      throw new Error("Failed to create gist: No URL returned");
    }

    return response.data.html_url;
  }
}
