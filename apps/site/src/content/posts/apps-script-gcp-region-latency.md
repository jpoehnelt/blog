---
title: Google Cloud Region Latency in Google Apps Script
description: >-
  Ping results to Google Cloud regions and  short code snippet demonstrating how
  to measure latency from Google Apps Script.
pubDate: "2024-03-15"
tags:
  - code
  - google
  - google workspace
  - apps script
  - google cloud
  - ping
  - latency
  - gcping
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
</script>

Ever wonder what the ping time is to Google Cloud regions from Google Apps Script? Here are the results for my Apps Script project with the default project id. Timezone is set to `America/Denver`, but I don't think that matters!

Here is a short and sweet snippet for measuring latency to Google Cloud regions in Google Apps Script.

<Snippet src="./snippets/apps-script-gcp-region-latency/ping.js" />

This is a followup on the work done by [GCPing](https://gcping.com/) and [Ivan Kutil](https://www.kutil.org/2019/06/how-to-measure-latency-between-google.html) in 2019.
