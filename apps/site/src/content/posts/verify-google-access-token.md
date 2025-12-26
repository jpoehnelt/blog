---
title: Verify a Google access token
description: A simple endpoint to verify a Google access token
pubDate: "2023-04-10"
tags:
  - code
  - google
  - oauth
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
</script>

A Google access token can be verified using the following command to an Oauth2 endpoint:

```bash
curl "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=$GOOGLE_ACCESS_TOKEN"
```

The response will include the scope and additional information about the access token similar to the following for a service account access token:

<Snippet src="./snippets/verify-google-access-token/example.sh" />
