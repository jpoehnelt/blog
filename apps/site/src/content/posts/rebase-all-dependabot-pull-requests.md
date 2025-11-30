---
title: Rebasing All Dependabot Pull Requests
description: >-
  Short code snippet showing how I rebased all Dependabot pull requests across a
  GitHub org.
pubDate: '2022-05-12'
tags: 'code,GitHub,gh,dependabot,snippet'
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

