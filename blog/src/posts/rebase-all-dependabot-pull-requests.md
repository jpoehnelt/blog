---
layout: post
title: Rebasing All Dependabot Pull Requests
excerpt: "Short code snippet showing how I rebased all Dependabot pull requests across a GitHub org."
tags:
    - post
    - code
    - GitHub
    - gh
    - dependabot
    - snippet
date: '2022-05-12T00:00:00.000Z'
---

The [GitHub cli tool](https://cli.github.com/) `gh` now has a search feature! I recently had a use case requiring DependaBot to rebase all pull requests across the GitHub organization repositories.

The following shell command did the trick by piping the output of `gh search prs` to `gh pr comment`:

```bash
gh search prs \
  --owner googlemaps \ # replace with GitHub owner
  --state open \
  --label dependencies \
  --limit 200 \
  --json "url" --jq ".[] | .url" \
| xargs -n 1 -I{} \
  gh pr comment -b "@dependabot rebase" {}
```

