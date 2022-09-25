---
layout: post
title: Caching Playwright Binaries in GitHub Actions
excerpt: "A simple strategy to effectively speed up use of Playwright in GitHub Actions with caching."
tags:
  - post
  - code
  - GitHub
  - playwright
  - workflows
date: "2022-09-22T00:00:00.000Z"
hideToc: true
---

I've always enjoyed using Playwright, but never want to wait for the binaries to download. I've tried a few different strategies to speed this up, but the one I've settled on is to cache the binaries in GitHub Actions.

The primary issue that I've had with caching the binaries is that while the binaries can easily be cached, the operating system dependencies must also be installed if not present. The key bits are in the following steps of my GitHub workflow.

{% raw %}
```yml
- uses: actions/cache@v2
  id: playwright-cache
  with:
    path: |
      ~/.cache/ms-playwright
    key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}
- run: npm ci
- run: npx playwright install --with-deps
  if: steps.playwright-cache.outputs.cache-hit != 'true'
- run: npx playwright install-deps
  if: steps.playwright-cache.outputs.cache-hit == 'true'
```
{% endraw %}

And it works! :tada:

{% image src="src/images/playwright-caching.png", alt="Output for the GitHub action with Playwright browser binaries cached" %}

{% inlineAd %}

If you don't do this properly, you might run into the following error.

> Host system is missing dependencies to run browsers.

{% image src="src/images/playwright-missing-dependencies-to-run-browsers.png", alt="Missing dependencies to run browsers" %}

Without any caching, the build took 1 minute and 43 seconds. With caching, but still installing the host dependencies, the time was 45 seconds, minus about 17 seconds for cache loading/saving, leads to a reduction of about 40 seconds for every build.

{% image src="src/images/playwright-build-time-without-caching.png", alt="Build time without caching" %}
