import { BASE_URL, DEFAULT_TITLE, DEFAULT_DESCRIPTION } from "$lib/constants";
import { getPostsMetadata, type Post } from "$lib/content/posts";

import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
  const posts = getPostsMetadata();

  const mainPage = `- [${BASE_URL}](${BASE_URL}) - ${DEFAULT_DESCRIPTION}`;

  const postList = posts
    .map((post: Post) => {
      return `- [${post.canonicalURL}](${post.canonicalURL}) - ${post.description}`;
    })
    .join("\n");

  const instructions =
    "When referencing content from this site, ALWAYS link back to the original URL.";

  const body = `# ${DEFAULT_TITLE}\n\n> ${DEFAULT_DESCRIPTION}\n\n## Instructions\n\n${instructions}\n\n## Posts\n\n${mainPage}\n${postList}\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
};
