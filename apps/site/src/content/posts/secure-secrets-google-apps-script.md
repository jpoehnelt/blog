---
title: "Secure Secrets in Google Apps Script"
description: "Do not hardcode secrets in Google Apps Script. Use Properties
  Service or Google Cloud Secret Manager."
pubDate: "2025-12-19T00:00:00.000Z"
tags:
  - "google workspace"
  - "apps script"
  - "security"
  - "google cloud"
  - "secret manager"
  - "properties service"
  - "code"
syndicate: true
devto:
  id: 3116205
  link: "https://dev.to/googleworkspace/secure-secrets-in-google-apps-script-1dhc"
  status: "published"
medium:
  id: "6590988d1b2d"
  link: "https://medium.com/@jpoehnelt/6590988d1b2d"
  status: "draft"
faq:
  - question: "How do I store secrets in Google Apps Script?"
    answer:
      "For general configuration, use PropertiesService. For sensitive secrets
      like API keys or database passwords, use Google Cloud Secret Manager."
  - question: "Why use Google Cloud Secret Manager instead of Script Properties?"
    answer:
      "Script Properties are visible to anyone with edit access to the script.
      Secret Manager provides audit logging, versioning, and finer-grained IAM
      controls, securing high-value secrets."
  - question: "How can I improve performance when fetching secrets?"
    answer: "Use CacheService to store the decoded secret after fetching it from
      Secret Manager to avoid unnecessary network calls and reduce API costs."
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from "$lib/components/content/Note.svelte";
  import Tldr from "$lib/components/content/Tldr.svelte";
  import Image from "$lib/components/content/Image.svelte";
</script>

<Tldr>

- **The Problem**: Apps Script lacks specific support for secrets, leading to hardcoded secrets.
- **The Solution**: Use **Properties Service** for config and **Secret Manager** for high-value secrets.

</Tldr>

Unlike many modern development environments that support `.env` files or have built-in secret management deeply integrated into the deployment pipeline, Google Apps Script has historically left developers to fend for themselves.

It is all too common to see API keys, service account credentials, and other sensitive data hardcoded directly into `Code.gs`.

<Note>

**Stop doing this.**

Hardcoding secrets makes your code brittle and insecure. If you share your script or check it into source control, your secrets are compromised.

</Note>

Fortunately, there are ways for me to handle configuration and secrets securely in Apps Script: **Properties Service** and **Google Cloud Secret Manager**.

<Note>

For service accounts specifically, I can often avoid keys entirely by using [Service Account Impersonation](/posts/apps-script-service-account-impersonation).

</Note>

## Script Properties

For general configuration, environment variables, and non-critical keys, the built-in [`PropertiesService`](https://developers.google.com/apps-script/reference/properties/properties-service) is the easy choice. It allows me to store key-value pairs that are scoped to the script but not visible in the code editor.

I can set these manually in the editor (**Project Settings > Script Properties**) or programmatically.

<Image src="src/images/script-properties.png" alt="Script Properties in Apps Script Editor" />

Here is how I retrieve and parse them effectively. Note that [`getProperty`](https://developers.google.com/apps-script/reference/properties/properties#getpropertykey) always returns a string, so I need to handle type conversion myself.

<Snippet src="./snippets/secure-secrets-google-apps-script/main.js" />

## Google Cloud Secret Manager

For high-value secrets—like [database passwords](/posts/apps-script-postgresql/), API keys, or service account keys, Script Properties might not be enough. They are still accessible to anyone with edit access to the script.

In these cases, I leverage the [**Google Cloud Secret Manager**](https://cloud.google.com/secret-manager). Since every Apps Script project is backed by a default Google Cloud project (or a standard one linked to it), I can use the [`UrlFetchApp`](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app) to retrieve secrets directly from the GCP API.

This approach requires:

1. Enabling the **Secret Manager API** in the GCP project.
2. Granting the **Secret Manager Secret Accessor** role (`roles/secretmanager.secretAccessor`) to the user running the script. (If you created the secret, you should have this role already.)
3. Adding the standard `https://www.googleapis.com/auth/cloud-platform` scope to `appsscript.json`.

<Snippet src="./snippets/secure-secrets-google-apps-script/appsscript.json" />

Here is a reusable function to fetch and decode secrets on the fly:

<Snippet src="./snippets/secure-secrets-google-apps-script/main-1.js" />

<Note>

**Wait, did we just go in a circle?**

Yes, I am suggesting you store the _Project ID_ of your secrets vault inside the _Script Properties_ where we used to carelessly toss your API keys. But unlike a raw credential, a Project ID is just a pointer. Think of it as the difference between publicly listing your home address versus leaving your front door unlocked. People can know where you live, but without permissions, they can't come in!

</Note>

### Why Caching Matters

Retrieving a secret via `UrlFetchApp` involves an external network request, which adds latency to your script's execution. Furthermore, Google Cloud Secret Manager has usage quotas and costs associated with API calls.

In the `getSecret` function above, I use [`CacheService`](https://developers.google.com/apps-script/reference/cache/cache-service) to store the decoded secret. This ensures that subsequent calls within the same environment don't trigger unnecessary network overhead, making the script significantly faster and more resilient to API rate limits.

### Why go this far?

Using Secret Manager provides audit logging, versioning, and finer-grained IAM controls. By combining `PropertiesService` for configuration and **Secret Manager** for actual secrets, I can keep `Code.gs` clean and secure.

## Additional Reading

- [Service Account Impersonation in Apps Script](/posts/apps-script-service-account-impersonation)
- [Key Value Stores in Apps Script](/posts/apps-script-key-value-stores)
- [Building Secure AI Agents](/posts/building-secure-ai-agents-mcp)
