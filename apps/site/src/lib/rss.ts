import { BASE_URL } from "./constants";
import { type Post } from "$lib/content/posts";

/**
 * Convert relative URLs to absolute URLs in HTML content
 */
export function htmlToAbsoluteUrls(
  html: string,
  baseUrl: string = BASE_URL,
): string {
  return (
    html
      // Convert relative image src
      .replace(/src="\/([^"]+)"/g, `src="${baseUrl}$1"`)
      // Convert relative href
      .replace(/href="\/([^"]+)"/g, `href="${baseUrl}$1"`)
      // Convert relative srcset
      .replace(/srcset="\/([^"]+)"/g, `srcset="${baseUrl}$1"`)
  );
}

/**
 * Simplify code highlighting for RSS readers by removing syntax highlighting classes
 * This makes code blocks more readable in RSS readers that don't support custom CSS
 */
export function simplifyCodeHighlighting(html: string): string {
  return (
    html
      // Remove data-rehype-pretty-code attributes
      .replace(/\s*data-rehype-pretty-code-[^=]*="[^"]*"/g, "")
      // Remove style attributes from code elements
      .replace(/<span[^>]*style="[^"]*"[^>]*>/g, "<span>")
      // Remove empty spans
      .replace(/<span>\s*<\/span>/g, "")
      // Simplify nested spans
      .replace(/<span>(<span>)/g, "$1")
      .replace(/(<\/span>)<\/span>/g, "$1")
  );
}

/**
 * Process HTML content for RSS feeds
 */
export function processContentForRss(html: string): string {
  let processed = html;
  processed = simplifyCodeHighlighting(processed);
  processed = htmlToAbsoluteUrls(processed);
  return processed;
}

/**
 * Filter posts by tag
 */
export function filterPostsByTag(posts: Post[], tag: string): Post[] {
  return posts.filter((post) => post.tags.includes(tag));
}

/**
 * Escape XML special characters
 */
export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Get the most recent update date from a list of posts
 */
export function getLastUpdatedDate(posts: Post[]): Date {
  if (posts.length === 0) {
    return new Date();
  }

  const dates = posts.map((post) => post.lastMod || post.pubDate);
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}
