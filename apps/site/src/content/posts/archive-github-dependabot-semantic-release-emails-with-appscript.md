---
title: Automatically Archiving Dependabot and Semantic Release Emails
description: Using Google Apps Script as part of my open source workflow.
pubDate: "2022-05-26"
tags:
  - code
  - GitHub
  - apps script
  - google workspace
  - dependabot
  - snippet
  - open source
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
</script>

As an Open Source maintainer, I get hundreds of emails a day from Dependabot and Semantic Release. A while back, I put together the below [Google Apps Script](https://developers.google.com/apps-script) snippet to automatically archive the emails based upon some simple regex patterns to accomplish the following tasks:

- Archive Dependabot emails that are merged or closed.
- Archive Semantic Release publish notifications on issues and pull requests.

Currently this is running in a cron every 5 minutes.

<Snippet src="./snippets/archive-github-dependabot-semantic-release-emails-with-appscript/main.js" />

This is all pretty basic, but it does the job. Future work might focus on inverting the dependabot functionality so that depending on the date of the thread and current status of the pull request, the thread will be moved to the inbox if action is required.

I have yet to find the perfect workflow for my open source work spanning different repositories, organizations, etc. Email is a good backstop for complete coverage and the scripts above give me some eventual consistency.
