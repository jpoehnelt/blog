import { XMLBuilder } from "fast-xml-parser";

import { BASE_URL, DEFAULT_TITLE, AUTHOR_NAME } from "$lib/constants";
import { getPostsMetadata, type Post } from "$lib/content/posts";
import { escapeXml, getLastUpdatedDate, filterPostsByTag } from "$lib/rss";


import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async ({ params }) => {
  const allPosts = getPostsMetadata();
  const posts =
    params.tag === "all" ? allPosts : filterPostsByTag(allPosts, params.tag);
  const lastUpdated = getLastUpdatedDate(posts);

  // Build entries with description only
  const entries = posts.map((post: Post) => {
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
        "#text": escapeXml(post.description),
      },
      category: post.tags.map((tag) => ({
        "@_term": tag,
      })),
    };
  });

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
