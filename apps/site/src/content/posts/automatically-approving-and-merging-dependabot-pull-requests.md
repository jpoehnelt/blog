---
title: Automatically Approving and Merging Dependabot Pull Requests
description: >-
  A simple GitHub workflow to automatically approve and merge Dependabot pull
  requests.
pubDate: "2022-05-12"
tags:
  - code
  - GitHub
  - dependabot
  - snippet
  - workflows
  - automation
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Image from '$lib/components/content/Image.svelte';
  import Note from '$lib/components/content/Note.svelte';
</script>

I've recently been using a combination of GitHub apps to automate the approval and merging of Dependabot pull requests, but wanted to simplify this into a GitHub workflow, using branch protection and GitHub's auto merge feature.

The GitHub workflow looks something like:

<Snippet src="./snippets/automatically-approving-and-merging-dependabot-pull-requests/dependabot.yaml" />

<Note>

❗ **Warning**: I wouldn't implement this without branch protection and required status checks.

</Note>

And it works! 🎉

The pull request now looks like the following:

<Image src="automating-dependabot-pull-requests.png" alt="Automating DependaBot pull request approval and merging" />

Once I had this implemented and pushed to all the repositories, I just need to [tell Dependabot to rebase all pull requests](/posts/rebase-all-dependabot-pull-requests/).

It would be fairly easy to add a check for labels on the pull request, and only `gh approve` if the label was present, but I really didn't have a use case for this right now because I feel confident in the required status checks.
