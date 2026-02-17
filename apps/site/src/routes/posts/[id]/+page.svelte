<script lang="ts">
  import FormattedDate from "$lib/components/FormattedDate.svelte";
  import Head from "$lib/components/Head.svelte";
  import PostList from "$lib/components/PostList.svelte";
  import TagButton from "$lib/components/TagButton.svelte";
  import {
    AUTHOR_NAME,
    AUTHOR_URL,
    AUTHOR_IMAGE,
    AUTHOR_JOB_TITLE,
    AUTHOR_DESCRIPTION,
    AUTHOR_SOCIAL_LINKS,
    AUTHOR_KNOWS_ABOUT,
    LICENSE,
    BASE_URL,
  } from "$lib/constants";
  import { isGoogleRelated } from "$lib/utils";
  import { siMarkdown } from "simple-icons";
  import BrandIcon from "$lib/components/BrandIcon.svelte";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  let isGoogle = $derived(isGoogleRelated(data.tags));
  import JsonLd from "$lib/components/JsonLd.svelte";
  import type { Thing, WithContext, FAQPage } from "schema-dts";

  // Use $derived to ensure PostContent updates when data changes (e.g. navigation)
  let PostContent = $derived(data.PostContent);

  let mergedPosts = $derived.by(() => {
    const posts = [...data.recommendations, ...data.latest];
    const seen = new Set<string>();
    return posts.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  });

  let schema: WithContext<Thing>[] = $derived([
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: data.title,
      description: data.description,
      author: {
        "@type": "Person",
        name: AUTHOR_NAME,
        url: AUTHOR_URL,
        image: AUTHOR_IMAGE,
        description: AUTHOR_DESCRIPTION,
        jobTitle: AUTHOR_JOB_TITLE,
        worksFor: {
          "@type": "Organization",
          name: "Google",
          url: "https://about.google/",
        },
        knowsAbout: AUTHOR_KNOWS_ABOUT,
        sameAs: AUTHOR_SOCIAL_LINKS,
      },
      datePublished: data.pubDate.toISOString(),
      dateModified: (data.lastMod || data.pubDate).toISOString(),
      url: data.canonicalURL,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: BASE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Posts",
          item: new URL("/posts/", BASE_URL).toString(),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: data.title,
          item: data.canonicalURL,
        },
      ],
    },
    ...(data.faq
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: data.faq.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answerHtml,
              },
            })),
          } as WithContext<FAQPage>,
        ]
      : []),
  ]);
</script>

<Head
  title={data.title}
  description={data.description}
  pathname={data.relativeURL}
  imagePath={`/posts/${data.id}/og.png`}
  type="article"
  publishedTime={data.pubDate.toISOString()}
  modifiedTime={(data.lastMod || data.pubDate).toISOString()}
/>

<JsonLd {schema} />

{#snippet toc(items: typeof data.toc)}
  {#if items && items.length > 1}
    <div class="mb-8 lg:mb-0">
      <h3 class="font-bold mb-4 uppercase text-xs text-gray-500">
        On this page
      </h3>
      <ul
        class="space-y-2 text-sm list-none pl-2 border-l border-gray-200 dark:border-gray-700"
      >
        {#each items as item}
          <li>
            <a
              href="#{item.id}"
              class="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 -ml-[1px]"
              class:pl-4={item.depth === 3}
            >
              {item.text}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
{/snippet}

<main
  class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6 lg:gap-12 justify-center"
>
  <div class="lg:hidden">
    {@render toc(data.toc)}
  </div>

  <article class="prose flex-1 min-w-0">
    <div class="flex flex-col gap-2">
      <h1 class="mb-0" style:view-transition-name="post-title-{data.id}">
        {data.title}
      </h1>
      <div class="flex flex-wrap gap-1 items-center text-xs text-gray-600 dark:text-gray-400">
        <span>
          By <a href="/about" class="font-semibold text-gray-900 dark:text-gray-100 no-underline hover:underline">{AUTHOR_NAME}</a>{#if isGoogle}<span class="text-gray-400 dark:text-gray-500">,
            {AUTHOR_JOB_TITLE} at Google</span>{/if}
        </span>
        <span class="text-gray-300 dark:text-gray-600">·</span>
        <span>
          <FormattedDate date={data.pubDate} />
        </span>
        {#if data.lastMod}
          <span class="text-gray-300 dark:text-gray-600">·</span>
          <span>
            Updated <FormattedDate date={data.lastMod} />
          </span>
        {/if}
        <a
          href={data.markdownURL}
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          title="View Markdown"
          aria-label="View Markdown"
          target="_blank"
          rel="noopener noreferrer"
        >
          <BrandIcon icon={siMarkdown} size={20} class="text-gray-500" />
        </a>
      </div>

      {#if data.tags && data.tags.length > 0}
        <div class="flex flex-wrap gap-2 mt-2">
          {#each data.tags as tag (tag)}
            <TagButton {tag} />
          {/each}
        </div>
      {/if}
    </div>

    <PostContent />

    {#if data.faq && data.faq.length > 0}
      <div class="mt-12 mb-12 not-prose">
        <h2 class="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <dl class="space-y-8">
          {#each data.faq as item}
            <div>
              <dt class="font-semibold text-lg mb-2">
                {@html item.questionHtml}
              </dt>
              <dd
                class="text-gray-600 dark:text-gray-400 leading-relaxed prose dark:prose-invert"
              >
                {@html item.answerHtml}
              </dd>
            </div>
          {/each}
        </dl>
      </div>
    {/if}

    <div class="mt-8">
      {#if isGoogle}
        <p class="text-xs text-gray-400 dark:text-gray-500 mb-2">
          Opinions expressed are my own and do not necessarily represent those of Google.
        </p>
      {/if}
      <p class="text-xs">
        © {data.pubDate.getFullYear()} by {AUTHOR_NAME} is licensed under {LICENSE}
      </p>
    </div>
  </article>

  <aside class="mt-8 lg:mt-0 prose w-full lg:w-72 shrink-0">
    <div class="hidden lg:block mb-8">
      {@render toc(data.toc)}
    </div>

    <h3>More Articles</h3>
    <PostList posts={mergedPosts} showTags={false} />
  </aside>
</main>
