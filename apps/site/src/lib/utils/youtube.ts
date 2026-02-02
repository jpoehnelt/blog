/**
 * Extracts a YouTube video ID from various YouTube URL formats.
 *
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 *
 * @param url - The YouTube URL to extract the video ID from
 * @returns The 11-character video ID, or null if not found
 */
export function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/,
  );
  return match?.[1] ?? null;
}

/**
 * Checks if a URL is a YouTube video URL.
 *
 * @param url - The URL to check
 * @returns true if the URL is a YouTube video URL
 */
export function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

/**
 * Gets the thumbnail URL for a YouTube video.
 *
 * @param videoId - The YouTube video ID
 * @param quality - The thumbnail quality (default: 'mqdefault')
 * @returns The thumbnail URL
 */
export function getYouTubeThumbnail(
  videoId: string,
  quality:
    | "default"
    | "mqdefault"
    | "hqdefault"
    | "sddefault"
    | "maxresdefault" = "mqdefault",
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}
