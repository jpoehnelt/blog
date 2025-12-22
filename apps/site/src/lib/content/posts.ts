import { error } from "@sveltejs/kit";
import type { Component } from "svelte";

const CONTENT_BASE_PATH = "/src/content/posts";

export * from "./posts.shared";

// Lazy load full post content on-demand
const posts = import.meta.glob("/src/content/posts/*.md");

export const getPostContent = async (id: string): Promise<Component> => {
  const filePath = `${CONTENT_BASE_PATH}/${id}.md`;
  const postLoader = posts[filePath];

  if (!postLoader) {
    throw error(404, `Not found: ${id}`);
  }

  const post = (await postLoader()) as {
    default: any;
    metadata: Record<string, unknown>;
  };

  return post.default;
};



