import { render } from "svelte/server";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRemoveComments from "rehype-remove-comments";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import matter from "gray-matter";
import { getPostContent, getPostMetadata } from "$lib/content/posts";
import type { RequestHandler } from "./$types";
import { AUTHOR_NAME, LICENSE, BASE_URL, PROMPT_SYSTEM } from "$lib/constants";

export const GET: RequestHandler = async ({ params, url }) => {
  const { body } = render(await getPostContent(params.id), {});
  const metadata = getPostMetadata(params.id);

  // Convert HTML back to Markdown using unified pipeline
  const file = await unified()
    .use(rehypeParse)
    .use(rehypeRemoveComments)
    .use(rehypeRemark)
    .use(remarkStringify)
    .process(body);

  const markdownBody = String(file);

  const note = `[${metadata.title}](${metadata.canonicalURL}) © ${metadata.pubDate.getFullYear()} by [${AUTHOR_NAME}](${BASE_URL}) is licensed under ${LICENSE}`;

  const finalContent = markdownBody + "\n\n" + note + "\n\n" + PROMPT_SYSTEM;

  // Use gray-matter to add frontmatter
  const result = matter.stringify(finalContent, metadata);

  return new Response(result, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
};
