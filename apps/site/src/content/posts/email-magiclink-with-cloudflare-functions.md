---
title: Using Cloudflare Pages and Functions for email magic links
description: >-
  This blog post demonstrates how to implement email magic links for a login
  page using Cloudflare Pages, Cloudflare Functions, and Sendgrid. It provides
  code examples and explanations for each step of the process, including form
  creation, token generation and validation, session management, and user
  authentication.
pubDate: "2023-07-06"
tags:
  - code
  - Cloudflare
  - email
  - Sendgrid
  - auth
  - magiclink
  - serverless
  - KV
  - functions
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Image from '$lib/components/content/Image.svelte';
  import Note from '$lib/components/content/Note.svelte';
</script>

I recently migrated a site from Wordpress to Eleventy and I wanted to add a login page that would send magic link to an email address. I was able to accomplish this using [Cloudflare Functions](https://developers.cloudflare.com/pages/platform/functions/) and [Sendgrid](https://sendgrid.com/).

<Note>

The code here is for a hobby site and should be evaluated for security before using in production.

</Note>

### Overview

The flow looks like this.

1. User enters email address and clicks "Send Magic Link" button.
2. Cloudflare Function generates a magic link and sends it to the email address provided.
3. User clicks the magic link and is redirected to the site with an opaque token in the URL.
4. Cloudflare Function validates the token and sets a cookie with the user's session id.

Requirements:

- Static page hosting - [Cloudflare Pages](https://pages.cloudflare.com/)
- Server execution - [Cloudflare Functions](https://developers.cloudflare.com/pages/platform/functions/)
- Session storage - [Cloudflare KV](https://developers.cloudflare.com/workers/runtime-apis/kv)
- Email provider - I used [Sendgrid](https://sendgrid.com/)

### HTML Form

I created a simple HTML form that would POST to `/auth/login` with the email address.

<Snippet src="./snippets/email-magiclink-with-cloudflare-functions/example.html" />

<Image src="email-magiclink-form.png" alt="Email magic link form" />

### Cloudflare Functions - Login

I created a Cloudflare Function that would generate a magic link and send it to the email address provided. The function is triggered by a POST request to `/auth/login`.

<Snippet src="./snippets/email-magiclink-with-cloudflare-functions/email.ts" />

This sends an email that looks like the following:

<Image src="email-magiclink-template.png" alt="Email magic link email" />

When the user clicks the magic link, they are redirected to `/auth/login` with the opaque token in the query string. The function validates the token and sets a cookie with the user's session id.

<Snippet src="./snippets/email-magiclink-with-cloudflare-functions/token.ts" />

### Cloudflare Functions - UserInfo

I also created a Cloudflare Function that would return the user's email address and possibly more data in the future. This is used by the client to determine if the user is logged in.

<Snippet src="./snippets/email-magiclink-with-cloudflare-functions/example.ts" />

Although this is a mostly static site, I am using AlpineJS.

<Snippet src="./snippets/email-magiclink-with-cloudflare-functions/example-1.js" />

Here is the simplified HTML snippet for the navbar which switches on user state.

<Snippet src="./snippets/email-magiclink-with-cloudflare-functions/example-1.html" />

### Cloudflare Pages - Middleware

I didn't want all pages to be guarded by the login page, so I created a middleware function that would redirect to the login page if the user was not logged in. The following snippet guards all pages/functions under `/app` and `/api`.

<Snippet src="./snippets/email-magiclink-with-cloudflare-functions/cookie.ts" />

### Configuration and Constants

In the above code, I used some shared configuration and constants. Here is the code for those.

<Snippet src="./snippets/email-magiclink-with-cloudflare-functions/token-query-param.ts" />

### Metrics

Here are the metrics for this tiny site for Cloudlfare Functions and Sendgrid.

<Image src="cloudflare-function-metrics.png" alt="Cloudflare Function metrics" />

<Image src="email-magiclink-sendgrid-metrics.png" alt="Sendgrid email metrics" />

And it's all working! 🎉

### Learnings

- I didn't get around to figuring out how to test/debug functions locally. This slowed down dev cycles. Typescript was helpful in catching errors though.
- It took me a bit to find the right Cloudflare docs and kept running into worker specific information. I was looking for Cloudflare Functions docs.
- Cloudflare KV was super convenient to use. I didn't have to worry about setting up a database or anything. I just used the API. The integration into the context was also nice.
- Sendgrid was easy to use. I just had to set up an API key and I was good to go. The dynamic templates were also nice to use.
