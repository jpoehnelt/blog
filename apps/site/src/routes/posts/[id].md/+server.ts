import { visit } from "unist-util-visit";
import { render } from "svelte/server";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRemoveComments from "rehype-remove-comments";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import matter from "gray-matter";
import {
  getPostContent,
  getPostMetadata,
  getPostsMetadata,
} from "$lib/content/posts";
import type { RequestHandler, EntryGenerator } from "./$types";
import { AUTHOR_NAME, LICENSE, BASE_URL, PROMPT_SYSTEM } from "$lib/constants";

export const prerender = true;

export const entries: EntryGenerator = () => {
  return getPostsMetadata().map((post) => ({ id: post.id }));
};

export const GET: RequestHandler = async ({ params }) => {
  const { body } = render(await getPostContent(params.id), {});
  const metadata = getPostMetadata(params.id);

  // Convert HTML back to Markdown using unified pipeline
  const file = await unified()
    .use(rehypeParse)
    .use(rehypeRemoveComments)
    .use(() => (tree) => {
      visit(tree, "element", (node: any) => {
        ["href", "src", "poster"].forEach((attr) => {
          if (node.properties?.[attr]?.startsWith("/")) {
            node.properties[attr] = new URL(
              node.properties[attr],
              BASE_URL,
            ).toString();
          }
        });
      });
    })
    .use(rehypeRemark)
    .use(remarkGfm)
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
