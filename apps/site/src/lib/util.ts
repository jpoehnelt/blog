export const importWithoutVite = (path: string) =>
  import(/* @vite-ignore */ path);

export function readingTime(postContent: string, { speed = 300 } = {}): number {
  if (!postContent) {
    return 0;
  }

  const content = postContent.replace(/(<([^>]+)>)/gi, "");
  const matches = content.match(/[\u0400-\u04FF]+|\S+\s*/g);
  const count = matches !== null ? matches.length : 0;

  return Math.ceil(count / speed);
}
