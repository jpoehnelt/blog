---
title: Rebasing All Dependabot Pull Requests
description: >-
  Short code snippet showing how I rebased all Dependabot pull requests across a
  GitHub org.
pubDate: "2022-05-12"
tags:
  - code
  - GitHub
  - gh
  - dependabot
  - snippet
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
</script>

The [GitHub cli tool](https://cli.github.com/) `gh` now has a search feature! I recently had a use case requiring DependaBot to rebase all pull requests across the GitHub organization repositories.

The following shell command did the trick by piping the output of `gh search prs` to `gh pr comment`:

<Snippet src="./snippets/rebase-all-dependabot-pull-requests/dependabot-rebase.sh" />
