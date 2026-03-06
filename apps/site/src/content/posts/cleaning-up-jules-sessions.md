---
title: Cleaning up Jules Sessions
description: A bash script to automatically delete old Jules sessions.
pubDate: "2026-01-29"
tags:
  - code
  - jules
  - automation
  - bash
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
</script>

As I've been working with Jules more and more, I've noticed my session list growing indefinitely. While it's great to have history, sometimes you just want a clean slate or to remove stale sessions that are no longer relevant.

I wrote a quick bash script to automate this process. It finds sessions older than a configurable number of days and deletes them using the API.

<Snippet src="./snippets/cleaning-up-jules-sessions/jules-clean.sh" />

To use it, you'll need to set your `JULES_API_KEY` environment variable.

```bash
export JULES_API_KEY="your_api_key_here"
./jules-clean.sh
```

You can find more details in the [Jules API documentation](https://jules.google/docs/api/reference/sessions#delete-a-session).
