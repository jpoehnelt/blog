import { Feed } from "feed";
import {
  BASE_URL,
  DEFAULT_TITLE,
  AUTHOR_NAME,
  AUTHOR_EMAIL,
} from "$lib/constants";
import { type Post } from "$lib/content/posts";
import { getPostsMetadata, getPostHtml } from "$lib/content/posts.server";
import { getLastUpdatedDate, processContentForRss } from "$lib/rss";
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
  const feedUrl = `${BASE_URL}feed/${params.tag}.xml`;
  const siteUrl = BASE_URL;

  const feed = new Feed({
    title: `${DEFAULT_TITLE} - ${params.tag}`,
    description: `Posts tagged with '${params.tag}'`,
    id: feedUrl,
    link: feedUrl,
    language: "en",
    image: `${BASE_URL}favicon.png`,
    favicon: `${BASE_URL}favicon.png`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${AUTHOR_NAME}`,
    updated: lastUpdated,
    generator: "Feed for Node.js",
    feedLinks: {
      atom: feedUrl,
    },
    author: {
      name: AUTHOR_NAME,
      email: AUTHOR_EMAIL,
      link: siteUrl,
    },
  });

  await Promise.all(
    posts.map(async (post: Post) => {
      const html = await getPostHtml(post.id);
      const contentHtml = processContentForRss(html);
      const url = `${BASE_URL}posts/${post.id}/`;

      feed.addItem({
        title: post.title,
        id: post.canonicalURL || url,
        link: post.canonicalURL || url,
        description: post.description,
        content: contentHtml,
        author: [
          {
            name: AUTHOR_NAME,
            email: AUTHOR_EMAIL,
            link: siteUrl,
          },
        ],
        date: post.pubDate,
        published: post.pubDate,
        category: post.tags.map((tag) => ({ name: tag, term: tag })),
      });
    }),
  );

  return new Response(feed.atom1(), {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "max-age=0, s-maxage=3600",
    },
  });
};
