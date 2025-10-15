---
layout: post
title: Automatically Approving and Merging Dependabot Pull Requests
excerpt: "A simple GitHub workflow to automatically approve and merge Dependabot pull requests."
tags:
    - post
    - code
    - GitHub
    - dependabot
    - snippet
    - workflows
    - automation
date: '2022-05-12T00:00:00.000Z'
---

I've recently been using a combination of GitHub apps to automate the approval and merging of Dependabot pull requests, but wanted to simplify this into a GitHub workflow, using branch protection and GitHub's auto merge feature.

The GitHub workflow looks something like:
{% raw %}
```yml
name: Dependabot
on: pull_request

permissions:
  contents: write

jobs:
  dependabot:
    runs-on: ubuntu-latest
    if: ${{ github.actor == 'dependabot[bot]' }}
    env:
      PR_URL: ${{github.event.pull_request.html_url}}
      GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}} # I use a PA token.
    steps:
      - name: approve
        run: gh pr review --approve "$PR_URL"
      - name: merge
        run: gh pr merge --auto --squash --delete-branch "$PR_URL"
```
{% endraw %}

:::note
:heavy_exclamation_mark: **Warning**: I wouldn't implement this without branch protection and required status checks.
:::

And it works! :tada: 

The pull request now looks like the following:

{% image src="src/images/automating-dependabot-pull-requests.png", alt="Automating DependaBot pull request approval and merging" %}

Once I had this implemented and pushed to all the repositories, I just need to [tell Dependabot to rebase all pull requests](/posts/rebase-all-dependabot-pull-requests/).

It would be fairly easy to add a check for labels on the pull request, and only `gh approve` if the label was present, but I really didn't have a use case for this right now because I feel confident in the required status checks.