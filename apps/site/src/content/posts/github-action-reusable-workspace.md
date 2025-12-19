---
title: Optimizing Parallel Jobs in a Github Workflow
description: >-
  A pattern for persisting the workspace files between parallel jobs in a GitHub
  Workflow.
pubDate: "2024-03-12"
tags:
  - code
  - GitHub
  - GitHub Actions
  - workflows
  - performance
---

<script>
  import Image from '$lib/components/content/Image.svelte';
</script>

This weekend I was trying to optimize a GitHub Actions workflow composed of three primary steps: build, preview, and test. I really wanted the build step to be followed by the in preview and test steps in parallel. My first thought was to use the `actions/cache` action to persist the workspace between jobs, but there was a little more boilerplate than I wanted because I didn't need to cache between different workflow runs, only jobs for a particular commit.

So I created a new action with two child actions [`jpoehnelt/reusable-workspace/save` and `jpoehnelt/reusable-workspace/restore`](https://github.com/jpoehnelt/reusable-workspace) to simplify the process.

![Performance](https://raw.githubusercontent.com/jpoehnelt/reusable-workspace/main/impact.gif)

The usage looks like the following.

```yml
name: CI

on:
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Build steps (save should be after this)
      - uses: jpoehnelt/reusable-workspace/save@v1
  preview:
    needs: [build]
    runs-on: ubuntu-latest
    steps:
      - uses: jpoehnelt/reusable-workspace/restore@v1
      # Additional steps (restore should be before this)
  test:
    needs: [build]
    runs-on: ubuntu-latest
    steps:
      - uses: jpoehnelt/reusable-workspace/restore@v1
        with:
          fail-on-miss: true
      # Additional steps (restore should be before this)
```

My workflow now runs the build and then the preview and test steps in parallel. The preview job can also use a matrix without needing to rebuild the workspace after this change.

<Image src="parallel-github-workflow.png" alt="Optimized parallel jobs in a GitHub workflow" />

This new action is a great way to optimize your GitHub Actions workflows and reduce the time it takes to run your CI/CD pipeline. I hope you find it useful, just include the following:

```yml
- uses: jpoehnelt/reusable-workspace/restore@v1
- uses: jpoehnelt/reusable-workspace/save@v1
```
