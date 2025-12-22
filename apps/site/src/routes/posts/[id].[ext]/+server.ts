import matter from "gray-matter";
import { getPostMarkdown, getPostMetadata, getPostsMetadata } from "$lib/content/posts.server";
import type { RequestHandler, EntryGenerator } from "./$types";
import { AUTHOR_NAME, LICENSE, BASE_URL, PROMPT_SYSTEM } from "$lib/constants";
import { error } from "@sveltejs/kit";

export const prerender = true;

export const entries: EntryGenerator = () => {
  return getPostsMetadata().flatMap((post) => [
    { id: post.id, ext: "md" },
    { id: post.id, ext: "json" },
  ]);
};

export const GET: RequestHandler = async ({ params }) => {
  const metadata = getPostMetadata(params.id);
  const markdown =
    (await getPostMarkdown(params.id)) +
    "\n\n" +
    `[${metadata.title}](${metadata.canonicalURL}) © ${metadata.pubDate.getFullYear()} by [${AUTHOR_NAME}](${BASE_URL}) is licensed under ${LICENSE}` +
    "\n\n<!--\n" +
    PROMPT_SYSTEM +
    "\n-->";

  if (params.ext === "md") {
    const result = matter.stringify(markdown, metadata);

    return new Response(result, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
      },
    });
  }

  if (params.ext === "json") {
    const result = { ...metadata, content: markdown };
    return new Response(JSON.stringify(result, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  }

  throw error(404, `Not found: ${params.id}`);
};
