---
title: Delete Old GitHub Forks
description: Cleanup repositories on GitHUb by deleting old forks.
pubDate: "2022-10-19"
tags:
  - code
  - GitHub
  - gh
  - forks
  - cleanup
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
</script>

Was browsing through my GitHub repositories and realized I have an embarrassing number of forks. A lot of these contain code that is either out of date or not even valid anymore. I used the following to quickly cleanup these repositories that I created before `2021-01-01`.

<Snippet src="./snippets/delete-old-github-forks/example.sh" />

You may need to refresh your auth with the `delete_repo` scope.

```bash
gh auth refresh -h github.com -s delete_repo
```
