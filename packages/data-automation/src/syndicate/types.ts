export interface SyndicateOptions {
  dryRun: boolean;
  mode: "pull" | "sync";
  force?: boolean;
  baseUrl?: string;
}

export interface SyndicationStatus {
  id: string | number;
  link: string;
  status: "draft" | "published";
}

export interface Frontmatter {
  title: string;
  description?: string;
  pubDate?: string;
  tags?: string[];
  canonicalURL?: string;
  canonical_url?: string;
  syndicate?: boolean;
  [key: string]: any;
}

export interface PostData {
  slug: string;
  content: string;
  frontmatter: Frontmatter;
  canonicalUrl: string;
}
