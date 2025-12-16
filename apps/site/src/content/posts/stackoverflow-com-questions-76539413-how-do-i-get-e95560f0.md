---
title: >-
  How do I get access to the chrome.sidePanel API from the latest manifest v3? -
  Stack Overflow
description: >-
  Link shared about: How do I get access to the chrome.sidePanel API from the
  latest manifest v3? - Stack Overflow
pubDate: "2024-04-06"
tags: "link,stackoverflow-com,chrome-sidePanel,manifest-v3,extension-api"
---

<script>
  import Image from '$lib/components/content/Image.svelte';
</script>

<Image src="https://storage.googleapis.com/download/storage/v1/b/jpoehnelt-blog/o/n8n%2F7512623b98db9b57a9c2c112405a1d90.png?generation=1712381869472858&alt=media" alt="How do I get access to the chrome.sidePanel API from the latest manifest v3? - Stack Overflow" />

Need to add this to the extension I am working on to help users get to the sidepanel more easily.

```js
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
```

From: [https://stackoverflow.com/questions/76539413/how...](https://stackoverflow.com/questions/76539413/how-do-i-get-access-to-the-chrome-sidepanel-api-from-the-latest-manifest-v3)
