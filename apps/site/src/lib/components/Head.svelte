<script lang="ts">
  import { BASE_URL, AUTHOR_NAME, AUTHOR_URL, DEFAULT_TITLE } from "$lib/constants";

  interface Props {
    title: string;
    description: string;
    pathname: string;
    imagePath?: string;
    type?: "website" | "article";
    publishedTime?: string;
    modifiedTime?: string;
    robots?: string;
    keywords?: string[];
  }

  let {
    title,
    description,
    pathname,
    imagePath,
    type = "website",
    publishedTime,
    modifiedTime,
    robots = "index, follow",
    keywords = [],
  }: Props = $props();

  const canonicalURL = new URL(pathname, BASE_URL).toString();
  const imageURL = imagePath 
    ? new URL(imagePath, BASE_URL).toString() 
    : undefined;
</script>

<svelte:head>
  <link rel="canonical" href={canonicalURL} data-pagefind-meta="url[href]" />

  <title>{title}</title>
  <meta name="title" content={title} />
  <meta name="description" content={description} />
  <meta name="author" content={AUTHOR_NAME} />
  <meta name="robots" content={robots} />
  {#if keywords.length > 0}
    <meta name="keywords" content={keywords.join(", ")} />
  {/if}

  <meta property="og:site_name" content={DEFAULT_TITLE} />
  <meta property="og:type" content={type} />
  <meta property="og:url" content={canonicalURL} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  {#if imageURL}
    <meta property="og:image" content={imageURL} />
  {/if}

  {#if type === "article" && publishedTime}
    <meta property="article:published_time" content={publishedTime} />
    {#if modifiedTime}
      <meta property="article:modified_time" content={modifiedTime} />
    {/if}
    <meta property="article:author" content={AUTHOR_URL} />
  {/if}

  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={canonicalURL} />
  <meta property="twitter:title" content={title} />
  <meta property="twitter:description" content={description} />
  {#if imageURL}
    <meta property="twitter:image" content={imageURL} />
  {/if}
</svelte:head>
