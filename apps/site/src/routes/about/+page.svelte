<script lang="ts">
  import Head from "$lib/components/Head.svelte";
  import JsonLd from "$lib/components/JsonLd.svelte";

  import {
    AUTHOR_NAME,
    AUTHOR_URL,
    AUTHOR_IMAGE,
    AUTHOR_JOB_TITLE,
    AUTHOR_DESCRIPTION,
    AUTHOR_SOCIAL_LINKS,
    AUTHOR_KNOWS_ABOUT,
    AUTHOR_EMAIL,
  } from "$lib/constants";
  import type { Thing, WithContext } from "schema-dts";

  const schema: WithContext<Thing>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
      image: AUTHOR_IMAGE,
      email: AUTHOR_EMAIL,
      description: AUTHOR_DESCRIPTION,
      jobTitle: AUTHOR_JOB_TITLE,
      worksFor: {
        "@type": "Organization",
        name: "Google",
        url: "https://about.google/",
      },
      alumniOf: [
        {
          "@type": "Organization",
          name: "Descartes Labs",
        },
        {
          "@type": "Organization",
          name: "U.S. Geological Survey",
        },
      ],
      affiliation: [
        {
          "@type": "Organization",
          name: "Falls Creek Ranch Association, Inc.",
          url: "https://fallscreekranch.org",
        },
        {
          "@type": "Organization",
          name: "Falls Creek Wildlands and Trails",
          url: "https://fcwt.org",
        },
      ],
      knowsAbout: AUTHOR_KNOWS_ABOUT,
      sameAs: [
        ...AUTHOR_SOCIAL_LINKS,
        "https://dev.to/googleworkspace",
        "https://stackoverflow.com/users/8715927/justin-poehnelt",
      ],
    },
  ];
</script>

<Head
  title="About — {AUTHOR_NAME}"
  description={AUTHOR_DESCRIPTION}
  pathname="/about"
  imagePath="/images/justin-poehnelt-avatar.jpg"
/>
<JsonLd {schema} />

<main class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
  <article class="prose">
    <div class="mb-8 not-prose">
      <h1 class="text-3xl font-bold mb-1">{AUTHOR_NAME}</h1>
      <p class="text-lg text-muted-foreground mb-3">
        {AUTHOR_JOB_TITLE} at <strong>Google</strong>
      </p>
      <p class="text-sm text-muted-foreground">
        {AUTHOR_DESCRIPTION}
      </p>
    </div>

    <h2>Background</h2>
    <p>
      I'm a Senior Developer Relations Engineer at Google, currently on the
      Google Workspace team. My day-to-day involves building tools, writing
      open-source libraries, and supporting the developer community around
      Google Workspace APIs, Apps Script, and Gemini integrations. Previously, I
      was on the <strong>Google Maps Platform</strong> team, where I led
      TypeScript support and maintained core client libraries.
    </p>
    <p>
      Before joining Google in 2019, I worked with geospatial data at
      <strong>Descartes Labs</strong> and the
      <strong>U.S. Geological Survey</strong>, building data platforms and
      working with satellite imagery at scale.
    </p>

    <h2>Open Source</h2>
    <p>
      I'm a maintainer and contributor to several open-source projects across
      the Google ecosystem and beyond:
    </p>
    <h3>Google</h3>
    <ul>
      <li>
        <a
          href="https://www.npmjs.com/package/@googleworkspace/drive-picker-element"
          target="_blank"
          rel="noopener noreferrer">@googleworkspace/drive-picker-element</a
        > — Web component for Google Drive Picker
      </li>
      <li>
        <a
          href="https://www.npmjs.com/package/@googleworkspace/drive-picker-react"
          target="_blank"
          rel="noopener noreferrer">@googleworkspace/drive-picker-react</a
        > — React wrapper for Google Drive Picker
      </li>
      <li>
        <a
          href="https://www.npmjs.com/package/@googlemaps/js-api-loader"
          target="_blank"
          rel="noopener noreferrer">@googlemaps/js-api-loader</a
        > — The official loader for the Google Maps JavaScript API
      </li>
      <li>
        <a
          href="https://www.npmjs.com/package/@googlemaps/react-wrapper"
          target="_blank"
          rel="noopener noreferrer">@googlemaps/react-wrapper</a
        > — React wrapper for Google Maps
      </li>
      <li>
        <a
          href="https://github.com/googleworkspace"
          target="_blank"
          rel="noopener noreferrer">Google Workspace</a
        > — Samples, add-ons, and tooling for the Workspace developer platform
      </li>
    </ul>
    <h3>Personal</h3>
    <ul>
      <li>
        <a
          href="https://github.com/jpoehnelt/secrets-sync-action"
          target="_blank"
          rel="noopener noreferrer">secrets-sync-action</a
        > — GitHub Action to sync secrets across repositories
      </li>
      <li>
        <a
          href="https://github.com/jpoehnelt/semantic-release-replace-plugin"
          target="_blank"
          rel="noopener noreferrer">semantic-release-replace-plugin</a
        > — semantic-release plugin for version replacement in files
      </li>
      <li>
        <a
          href="https://github.com/jpoehnelt/in-solidarity-bot"
          target="_blank"
          rel="noopener noreferrer">in-solidarity-bot</a
        > — GitHub App for inclusive language in pull requests
      </li>
      <li>
        <a
          href="https://github.com/jpoehnelt/apps-script"
          target="_blank"
          rel="noopener noreferrer">apps-script</a
        > — Monorepo of tools and projects for Google Apps Script
      </li>
    </ul>

    <h2>Speaking &amp; Content</h2>
    <ul>
      <li>
        <a href="/posts/2024-google-next-talk-rust-python-apps-script/"
          >Google Cloud Next '24</a
        > — <em
          >Unleashing the power of Rust, Python, and WebAssembly in Apps
          Script</em
        >
      </li>
      <li>
        <a href="/posts/2024-workspace-developer-summits/"
          >Google Workspace Developer Summits 2024</a
        > — Boston &amp; Berlin
      </li>
      <li>
        <a
          href="https://www.youtube.com/@GoogleWorkspaceDevs/search?query=poehnelt"
          target="_blank"
          rel="noopener noreferrer">@GoogleWorkspaceDevs</a
        > — Google Workspace Developer News, tutorials, and developer spotlights
      </li>
      <li>
        <a
          href="https://dev.to/googleworkspace"
          target="_blank"
          rel="noopener noreferrer">dev.to/googleworkspace</a
        > — Articles on Apps Script, Gemini, Vertex AI, and developer spotlights
      </li>
      <li>
        <a
          href="https://stackoverflow.com/users/8715927/justin-poehnelt"
          target="_blank"
          rel="noopener noreferrer">Stack Overflow</a
        > — Answering questions on Google Maps and Workspace
      </li>
    </ul>

    <h2>Beyond Code</h2>
    <p>
      When I'm not coding, I'm usually running long distances in the mountains
      of Colorado. I've completed 35+ ultramarathons including multi-day
      events like the Moab 240 and Cocodona 250. Notable results include 1st at
      the Ute 100 50-miler, 2nd at Creede 100, and 2nd at Deadman Peaks. I serve on the boards of the
      <a
        href="https://fallscreekranch.org"
        target="_blank"
        rel="noopener noreferrer">Falls Creek Ranch Association</a
      >
      and
      <a href="https://fcwt.org" target="_blank" rel="noopener noreferrer"
        >Falls Creek Wildlands and Trails</a
      >.
    </p>

    <h2>Connect</h2>
    <ul>
      <li>
        <a
          href="https://github.com/jpoehnelt"
          target="_blank"
          rel="noopener noreferrer">GitHub</a
        >
      </li>
      <li>
        <a
          href="https://www.linkedin.com/in/justin-poehnelt"
          target="_blank"
          rel="noopener noreferrer">LinkedIn</a
        >
      </li>
      <li>
        <a
          href="https://www.strava.com/athletes/2170160"
          target="_blank"
          rel="noopener noreferrer">Strava</a
        >
      </li>
      <li>
        <a
          href="https://stackoverflow.com/users/8715927/justin-poehnelt"
          target="_blank"
          rel="noopener noreferrer">Stack Overflow</a
        >
      </li>
      <li>
        <a
          href="https://dev.to/jpoehnelt"
          target="_blank"
          rel="noopener noreferrer">DEV Community</a
        >
      </li>
    </ul>
  </article>
</main>
