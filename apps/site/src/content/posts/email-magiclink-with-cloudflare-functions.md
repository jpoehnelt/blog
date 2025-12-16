---
title: Using Cloudflare Pages and Functions for email magic links
description: >-
  This blog post demonstrates how to implement email magic links for a login
  page using Cloudflare Pages, Cloudflare Functions, and Sendgrid. It provides
  code examples and explanations for each step of the process, including form
  creation, token generation and validation, session management, and user
  authentication.
pubDate: "2023-07-06"
tags: "code,Cloudflare,email,Sendgrid,auth,magiclink,serverless,KV,functions"
---

<script>
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

```html
<form action="/auth/login" method="post">
  <div class="mb-4">
    <label for="email"> Email </label>
    <input
      id="email"
      name="email"
      type="text"
      placeholder="Email"
      class="input"
    />
  </div>

  <div class="flex items-center justify-between">
    <button type="submit" class="button w-full">Sign In</button>
  </div>
</form>
```

<Image src="src/images/email-magiclink-form.png" alt="Email magic link form" />

### Cloudflare Functions - Login

I created a Cloudflare Function that would generate a magic link and send it to the email address provided. The function is triggered by a POST request to `/auth/login`.

```js
export const onRequestPost: Func = async (context) => {
  const email = (await context.request.formData()).get("email");

  if (!email) {
    return REDIRECT_LOGIN_RESPONSE;
  }

  const token = crypto.randomUUID();
  // persist opaque token that expires in 5 minutes
  await context.env.KV.put(token, email, { expirationTtl: 60 * 5 });

  const url = `${
    new URL(context.request.url).href
  }?${TOKEN_QUERY_PARAM}=${encodeURIComponent(token)}`;

  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${context.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email }],
          dynamic_template_data: {
            loginLink: url,
          },
        },
      ],
      from: { email: context.env.EMAIL_FROM },
      reply_to: { email: context.env.EMAIL_REPLY_TO },
      template_id: "d-1368124dc6e34f879245d3f23cb36f55",
    }),
  });

  return new Response(null, {
    headers: {
      Location: "/auth/sent", // Redirect to a page that says "Check your email"
    },
    status: 302,
  });
};
```

This sends an email that looks like the following:

<Image src="src/images/email-magiclink-template.png" alt="Email magic link email" />

When the user clicks the magic link, they are redirected to `/auth/login` with the opaque token in the query string. The function validates the token and sets a cookie with the user's session id.

```js
export const onRequestGet: Func = async (context) => {
  const token = new URL(context.request.url).searchParams.get(
    TOKEN_QUERY_PARAM
  );

  let email: string;

  if (token && (email = await context.env.KV.get(token))) {
    await context.env.KV.delete(token);

    const sessionId = crypto.randomUUID();

    await context.env.KV.put(sessionId, email, {
      expirationTtl: EXPIRATION_TTL,
    });

    return new Response(null, {
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "set-cookie": `${COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; Secure; max-age=${EXPIRATION_TTL}; SameSite=Strict`,
        Location: "/",
      },
      status: 302,
    });
  }

  return REDIRECT_LOGIN_RESPONSE;
};
```

### Cloudflare Functions - UserInfo

I also created a Cloudflare Function that would return the user's email address and possibly more data in the future. This is used by the client to determine if the user is logged in.

```js
export const onRequestGet: Func = async (context) => {
  return new Response(JSON.stringify({ email: context.data.email }), {
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });
};
```

Although this is a mostly static site, I am using AlpineJS.

```js
import Alpine from "alpinejs";

window.Alpine = Alpine;

window.fetchUserInfo = async () => {
  return (await fetch("/auth/userinfo")).json().catch(() => ({}));
};

Alpine.start();
```

Here is the simplified HTML snippet for the navbar which switches on user state.

```html
<div
  x-data="{ open: false, userInfo: {} }"
  x-init="userInfo = (await fetchUserInfo())"
>
  <a x-show="!userInfo?.email" href="/auth/" class="button">Login</a>
  <div x-show="userInfo?.email">...</div>
</div>
```

### Cloudflare Pages - Middleware

I didn't want all pages to be guarded by the login page, so I created a middleware function that would redirect to the login page if the user was not logged in. The following snippet guards all pages/functions under `/app` and `/api`.

```js
import { parse } from "cookie";
import { COOKIE_NAME, Func, REDIRECT_LOGIN_RESPONSE } from "./_common";
import sentryPlugin from "@cloudflare/pages-plugin-sentry";

const session: Func = async (context) => {
  const cookie = parse(context.request.headers.get("Cookie") || "");

  let sessionId: string;

  if (cookie && (sessionId = cookie[COOKIE_NAME])) {
    context.data.sessionId = sessionId;
    context.data.email = await context.env.KV.get(sessionId);
    context.data.sentry.setUser({ email: context.data.email });
  }

  return await context.next();
};

const authorize: Func = async (context) => {
  const pathname = new URL(context.request.url).pathname;

  if (/^\/app/gi.test(pathname) && !context.data.email) {
    return REDIRECT_LOGIN_RESPONSE;
  }

  if (/^\/api/gi.test(pathname) && !context.data.email) {
    return new Response(JSON.stringify({ error: "Not authorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
    });
  }

  return await context.next();
};

const sentry: Func = (context) => {
  return sentryPlugin({ dsn: context.env.SENTRY_DSN })(context);
};

export const onRequest: Func[] = [sentry, session, authorize];
```

### Configuration and Constants

In the above code, I used some shared configuration and constants. Here is the code for those.

```js
import { PluginData } from "@cloudflare/pages-plugin-sentry";

export interface Env {
  SENDGRID_API_KEY: string;
  SENTRY_DSN: string;
  EMAIL_REPLY_TO: string;
  EMAIL_FROM: string;
  KV: KVNamespace;
}

export const TOKEN_QUERY_PARAM = "token";
export const EXPIRATION_TTL = 86400;
export const COOKIE_NAME = "sessionId";

export const REDIRECT_LOGIN_RESPONSE = new Response(null, {
  status: 302,
  headers: {
    Location: "/auth",
  },
});

export type Data = {
  sessionId?: string;
  email?: string;
} & PluginData;

export type Func = PagesFunction<Env, any, Data>;
```

### Metrics

Here are the metrics for this tiny site for Cloudlfare Functions and Sendgrid.

<Image src="src/images/cloudflare-function-metrics.png" alt="Cloudflare Function metrics" />

<Image src="src/images/email-magiclink-sendgrid-metrics.png" alt="Sendgrid email metrics" />

And it's all working! 🎉

### Learnings

- I didn't get around to figuring out how to test/debug functions locally. This slowed down dev cycles. Typescript was helpful in catching errors though.
- It took me a bit to find the right Cloudflare docs and kept running into worker specific information. I was looking for Cloudflare Functions docs.
- Cloudflare KV was super convenient to use. I didn't have to worry about setting up a database or anything. I just used the API. The integration into the context was also nice.
- Sendgrid was easy to use. I just had to set up an API key and I was good to go. The dynamic templates were also nice to use.
