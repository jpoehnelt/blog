import { XMLBuilder } from "fast-xml-parser";

import { BASE_URL } from "$lib/constants";
import { type Post } from "$lib/content/posts";
import { getAllTags, getPostsMetadata } from "$lib/content/posts.server";

import racesData from "$data/races.json";

import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
  const posts = getPostsMetadata();
  const tags = getAllTags();

  const today = new Date().toISOString().split("T")[0];

  // Get unique years from races
  const raceYears = [...new Set(racesData.map((r: any) => r.year))];

  // Generate race URLs
  const raceUrls = racesData.flatMap((race: any) => {
    const raceLastmod = race.date
      ? new Date(race.date).toISOString().split("T")[0]
      : today;
    return [
      // Race page (event selection)
      {
        loc: `${BASE_URL}ultras/races/${race.year}/${race.slug}/${race.id}/`,
        lastmod: raceLastmod,
      },
      // Individual event pages
      ...race.events.map((event: any) => ({
        loc: `${BASE_URL}ultras/races/${race.year}/${race.slug}/${race.id}/${event.id}/`,
        lastmod: raceLastmod,
      })),
    ];
  });

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
        { loc: `${BASE_URL}about/`, lastmod: today },
        { loc: `${BASE_URL}posts/`, lastmod: today },
        { loc: `${BASE_URL}tags/`, lastmod: today },
        { loc: `${BASE_URL}ultras/races/`, lastmod: today },
        // Race year pages
        ...raceYears.map((year: number) => ({
          loc: `${BASE_URL}ultras/races/${year}/`,
          lastmod: today,
        })),
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
        )

        .concat(raceUrls),
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
