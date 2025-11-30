import { XMLBuilder } from "fast-xml-parser";

import { BASE_URL } from "$lib/constants";
import { getAllTags, getPostsMetadata, type Post } from "$lib/content";

import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
  const posts = getPostsMetadata();
  const tags = getAllTags();
  const today = new Date().toISOString().split("T")[0];

  const sitemapObject = {
    urlset: {
      "@_xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
      "@_xmlns:xhtml": "https://www.w3.org/1999/xhtml",
      "@_xmlns:mobile": "https://www.google.com/schemas/sitemap-mobile/1.0",
      "@_xmlns:news": "https://www.google.com/schemas/sitemap-news/0.9",
      "@_xmlns:image": "https://www.google.com/schemas/sitemap-image/1.1",
      "@_xmlns:video": "https://www.google.com/schemas/sitemap-video/1.1",
      url: [
        // Main pages
        { loc: BASE_URL, lastmod: today },
        { loc: `${BASE_URL}posts/`, lastmod: today },
        { loc: `${BASE_URL}tags/`, lastmod: today },
      ]
        .concat(
          // Blog posts
          posts.map((post: Post) => ({
            loc: post.canonicalURL,
            lastmod: (post.lastMod || post.pubDate).toISOString().split("T")[0],
          })),
        )
        .concat(
          // Tag pages
          tags.map((tag: string) => ({
            loc: `${BASE_URL}tags/${encodeURIComponent(tag)}/`,
            lastmod: today,
          })),
        ),
    },
  };

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
  });

  const sitemapXml = builder.build(sitemapObject);

  return new Response(sitemapXml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};
