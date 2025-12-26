---
title: Caching Playwright Binaries in GitHub Actions
description: >-
  A simple strategy to effectively speed up use of Playwright in GitHub Actions
  with caching.
pubDate: "2022-09-22"
tags:
  - code
  - GitHub
  - playwright
  - workflows
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Image from '$lib/components/content/Image.svelte';
</script>

I've always enjoyed using Playwright, but never want to wait for the binaries to download. I've tried a few different strategies to speed this up, but the one I've settled on is to cache the binaries in GitHub Actions.

The primary issue that I've had with caching the binaries is that while the binaries can easily be cached, the operating system dependencies must also be installed if not present. The key bits are in the following steps of my GitHub workflow.

<Snippet src="./snippets/caching-playwright-in-github-actions/cache-workflow.yaml" />

And it works! 🎉

<Image src="playwright-caching.png" alt="Output for the GitHub action with Playwright browser binaries cached" />

If you don't do this properly, you might run into the following error.

> Host system is missing dependencies to run browsers.

<Image src="playwright-missing-dependencies-to-run-browsers.png" alt="Missing dependencies to run browsers" />

Without any caching, the build took 1 minute and 43 seconds. With caching, but still installing the host dependencies, the time was 45 seconds, plus about 17 seconds for cache loading/saving, leading to a reduction of about 40 seconds for every build.

<Image src="playwright-build-time-without-caching.png" alt="Build time without caching" />
