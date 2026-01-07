import { XMLBuilder } from "fast-xml-parser";

import { BASE_URL, DEFAULT_TITLE, AUTHOR_NAME } from "$lib/constants";
import { type Post } from "$lib/content/posts";
import { getPostsMetadata, getPostHtml } from "$lib/content/posts.server";
import {
  escapeXml,
  getLastUpdatedDate,
  filterPostsByTag,
  processContentForRss,
} from "$lib/rss";

import type { RequestHandler, EntryGenerator } from "./$types";
import { getAllTags } from "$lib/content/posts.server";
import { slugify } from "$lib/utils/slugify";

export const prerender = true;

export const entries: EntryGenerator = () => {
  const tags = getAllTags();
  return [
    { tag: "all" },
    ...tags.map((tag) => ({
      tag: slugify(tag),
    })),
  ];
};

export const GET: RequestHandler = async ({ params }) => {
  const allPosts = getPostsMetadata();
  const posts =
    params.tag === "all"
      ? allPosts
      : allPosts.filter((post) =>
          post.tags.some((tag) => slugify(tag) === params.tag),
        );
  const lastUpdated = getLastUpdatedDate(posts);

  // Build entries with description only
  const entries = await Promise.all(
    posts.map(async (post: Post) => {
      const html = await getPostHtml(post.id);
      const contentHtml = processContentForRss(html);

      return {
        title: post.title,
        link: {
          "@_href": post.canonicalURL,
        },
        id: post.canonicalURL,
        updated: (post.lastMod || post.pubDate).toISOString(),
        published: post.pubDate.toISOString(),
        content: {
          "@_type": "html",
          "#text": contentHtml,
        },
        category: post.tags.map((tag) => ({
          "@_term": tag,
        })),
      };
    }),
  );

  const feedObject = {
    "?xml": {
      "@_version": "1.0",
      "@_encoding": "utf-8",
    },
    feed: {
      "@_xmlns": "http://www.w3.org/2005/Atom",
      title: `${DEFAULT_TITLE} - ${params.tag}`,
      subtitle: `Posts tagged with '${params.tag}'`,
      link: [
        {
          "@_href": `${BASE_URL}feed/${params.tag}.xml`,
          "@_rel": "self",
          "@_type": "application/atom+xml",
        },
      ],
      updated: lastUpdated.toISOString(),
      id: `${BASE_URL}feed/${params.tag}.xml`,
      author: {
        name: AUTHOR_NAME,
      },
      entry: entries,
    },
  };

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true,
  });

  const feedXml = builder.build(feedObject);

  return new Response(feedXml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "max-age=0, s-maxage=3600",
    },
  });
};
