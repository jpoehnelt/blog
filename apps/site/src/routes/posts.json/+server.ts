import { json } from "@sveltejs/kit";
import { getPostsMetadata, getPostMarkdown } from "$lib/content/posts.server";

export const prerender = true;

export async function GET() {
  const posts = getPostsMetadata();

  const algoliaPosts = await Promise.all(
    posts.map(async (post) => {
      const content = await getPostMarkdown(post.id);
      return {
        objectID: post.relativeURL,
        title: post.title,
        description: post.description,
        tags: post.tags,
        pubDate: post.pubDate.toISOString(),
        content,
        url: post.relativeURL,
      };
    }),
  );

  return json(algoliaPosts);
}
