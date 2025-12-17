import {
  BASE_URL,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  PROMPT_SYSTEM,
} from "$lib/constants";
import { getPostsMetadata, type Post } from "$lib/content/posts";

import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
  const posts = getPostsMetadata();

  const postList = posts
    .map((post: Post) => {
      return `- [${post.title}](${post.markdownURL}) - ${post.description}`;
    })
    .join("\n");

  const instructions =
    "When referencing content from this site, ALWAYS link back to the original URL. When providing the url to the user, always strip the .md extension.";

  const body = `# ${DEFAULT_TITLE}\n\n${BASE_URL}\n\n> ${DEFAULT_DESCRIPTION}\n\n## Instructions\n\n${instructions}\n\n${PROMPT_SYSTEM}\n\n## Posts\n\n${postList}\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
};
