import { XMLBuilder } from "fast-xml-parser";

import {
  BASE_URL,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  AUTHOR_NAME,
} from "$lib/constants";
import { getPostsMetadata, type Post } from "$lib/content/posts";
import { getPostHtml, processContentForRss, escapeXml } from "$lib/rss";
import {
  getStravaActivities,
  getActivitySlug,
  getActivityDescription,
} from "$lib/content/strava";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
  const posts = getPostsMetadata();
  const activities = await getStravaActivities();

  // Build post entries
  const postEntries = await Promise.all(
    posts.map(async (post: Post) => {
      const html = await getPostHtml(post.id);
      const content = html ? processContentForRss(html) : post.description;

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
          "#text": escapeXml(content),
        },
        category: post.tags.map((tag) => ({
          "@_term": tag,
        })),
      };
    }),
  );

  // Build activity entries
  const activityEntries = activities.map((activity) => {
    const description = getActivityDescription(activity);
    // Convert plain text description to HTML for RSS
    const content = description
      .split("\n\n")
      .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
      .join("");

    return {
      title: activity.name,
      link: {
        "@_href": `${BASE_URL}activities/${getActivitySlug(activity)}`,
      },
      id: `${BASE_URL}activities/${getActivitySlug(activity)}`,
      updated: new Date(activity.start_date).toISOString(),
      published: new Date(activity.start_date).toISOString(),
      content: {
        "@_type": "html",
        "#text": escapeXml(content),
      },
      category: [
        { "@_term": "Activity" },
        { "@_term": activity.sport_type || (activity as any).type },
      ],
    };
  });

  const allEntries = [...postEntries, ...activityEntries].sort((a, b) => {
    return new Date(b.published).getTime() - new Date(a.published).getTime();
  });

  const lastUpdated = new Date(
    Math.max(
      ...posts.map((p) => (p.lastMod || p.pubDate).getTime()),
      ...activities.map((a) => new Date(a.start_date).getTime()),
    ),
  );

  const feedObject = {
    "?xml": {
      "@_version": "1.0",
      "@_encoding": "utf-8",
    },
    feed: {
      "@_xmlns": "http://www.w3.org/2005/Atom",
      title: DEFAULT_TITLE,
      subtitle: DEFAULT_DESCRIPTION || "Personal blog and portfolio",
      link: [
        {
          "@_href": BASE_URL,
        },
        {
          "@_href": `${BASE_URL}feed/all.xml`,
          "@_rel": "self",
          "@_type": "application/atom+xml",
        },
      ],
      updated: lastUpdated.toISOString(),
      id: `${BASE_URL}feed/all.xml`,
      author: {
        name: AUTHOR_NAME,
      },
      entry: allEntries,
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
