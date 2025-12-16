---
title: GitHub Workflow to Sync Branches
description: >-
  It is easy to sync branches in a GitHub workflow without using a third party
  GitHub Action.
pubDate: "2022-04-12"
tags: "code,GitHub,automation,workflows"
---

## Problem

I have a GitHub repository using `main` as the default branch, but I am trying to integrate a third party tool (loading JSFiddle contents from GitHub) that has `master` hardcoded as the default branch.

There is an [issue in the tool](https://github.com/jsfiddle/jsfiddle-issues/issues/1665), but stale bot has killed it.

## Requirements

- Every push to main will also be applied to master.
- Both branches will share the same refs and tags.
- No workflows will execute on pushes to the `master` branch.
- No manual interaction is required (no pull requests).
- A maximum delay of only a few minutes.

## Implementation

Below is a simple GitHub workflow that pushes `main` to `master`. The key option to be aware of is the `fetch-depth` for [actions/checkout](https://github.com/actions/checkout), which fetches all branches and tags for the repository. The default is to only get the current branch.

> Only a single commit is fetched by default, for the ref/SHA that triggered the workflow. Set fetch-depth: 0 to fetch all history for all branches and tags. Refer [here](https://help.github.com/en/articles/events-that-trigger-workflows) to learn which commit $GITHUB_SHA points to for different events.

```yaml
# .github/workflows/push-to-master.yml
name: Push to Master
on:
  push:
    branches:
      - main
jobs:
  push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - name: Update master branch from main
        run: |
          git config --global user.name 'Justin Poehnelt'
          git config --global user.email 'jpoehnelt@users.noreply.github.com'
          git checkout master
          git reset --hard origin/main
          git push origin master
```

Depending on how you use GitHub workflows, you may also want to ignore the `master` branch. The following workflow will trigger on every branch except `master` using [branches-ignore](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onpushbranchestagsbranches-ignoretags-ignore).

```yaml
on:
  push:
    branches-ignore:
      - master
```
