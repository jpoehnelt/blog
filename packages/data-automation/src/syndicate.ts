import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import glob from "fast-glob";
import matter from "gray-matter";
import axios from "axios";
import { readFile } from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const API_KEY = process.env.DEVTO_API_KEY;
const SITE_BUILD_PATH = path.resolve(
  process.cwd(),
  "../../apps/site/build/posts",
);

if (!API_KEY) {
  console.error("Missing DEVTO_API_KEY environment variable");
  process.exit(1);
}

const argv = yargs(hideBin(process.argv))
  .option("slug", {
    type: "string",
    description: "Specific slug to syndicate",
  })
  .parseSync();

async function main() {
  const pattern = argv.slug
    ? `${SITE_BUILD_PATH}/${argv.slug}.md`
    : `${SITE_BUILD_PATH}/*.md`;

  const files = await glob(pattern);

  if (files.length === 0) {
    console.log("No files found to syndicate.");
    return;
  }

  console.log(`Found ${files.length} files. Processing...`);

  // Fetch current user articles to check for duplicates
  // Note: /api/articles/me/all returns all articles (published and unpublished)
  const userArticles = await fetchAllUserArticles();
  const canonicalMap = new Map<string, any>();
  
  // Create map of canonical_url -> article
  userArticles.forEach((article: any) => {
      // canonical_url helps us match existing posts
      // Dev.to api response includes canonical_url
      if (article.canonical_url) {
          canonicalMap.set(article.canonical_url, article);
      }
  });

  for (const file of files) {
    await processFile(file, canonicalMap);
  }
}

async function fetchAllUserArticles() {
    let page = 1;
    let allArticles: any[] = [];
    while (true) {
        try {
            const response = await axios.get("https://dev.to/api/articles/me/all", {
                headers: { "api-key": API_KEY },
                params: { page, per_page: 1000 } // Maximize per_page
            });
            if (response.data.length === 0) break;
            allArticles = allArticles.concat(response.data);
            page++;
        } catch (error) {
            console.error("Error fetching articles:", error);
            process.exit(1);
        }
    }
    return allArticles;
}

async function processFile(filePath: string, canonicalMap: Map<string, any>) {
  const content = await readFile(filePath, "utf-8");
  const parsed = matter(content);
  const metadata = parsed.data;

  // Check strict syndication flag
  if (metadata.syndicate !== true) {
    console.log(`Skipping ${path.basename(filePath)} (syndicate !== true)`);
    return;
  }

  const payload = {
    article: {
      title: metadata.title,
      body_markdown: parsed.content, // Content without frontmatter (gray-matter splits it)
      published: false, // Always creating as draft first
      canonical_url: metadata.canonicalURL, // Ensure this matches frontmatter key from server
      tags: metadata.tags.slice(0,4).map((tag: string) => tag.toLowerCase().replace(/\s+/g, "")),
      description: metadata.description,
      // series: metadata.series // if we had series support
    },
  };
  
  // Check if article exists
  const existing = canonicalMap.get(metadata.canonicalURL);

  if (existing) {
      if (existing.published) {
          console.log(`Skipping ${metadata.title} - Already published on Dev.to (ID: ${existing.id})`);
      } else {
          console.log(`Updating draft ${metadata.title} (ID: ${existing.id})...`);
          try {
              await axios.put(`https://dev.to/api/articles/${existing.id}`, payload, {
                  headers: { "api-key": API_KEY, "Content-Type": "application/json" }
              });
              console.log("Updated successfully.");
          } catch (e: any) {
              console.error(`Failed to update ${metadata.title}:`, e.message);
              if (e.response) console.error(e.response.data);
          }
      }
  } else {
      console.log(`Creating new draft for ${metadata.title}...`);
      try {
          await axios.post("https://dev.to/api/articles", payload, {
              headers: { "api-key": API_KEY, "Content-Type": "application/json" }
          });
          console.log("Created successfully.");
      } catch (e: any) {
          console.error(`Failed to create ${metadata.title}:`, e.message);
           if (e.response) console.error(e.response.data);
      }
  }
}

main().catch(console.error);
