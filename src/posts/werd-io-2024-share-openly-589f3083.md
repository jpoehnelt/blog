---
layout: post
title: "Share Openly"
excerpt: "Link shared about: Share Openly"
date: "2024-03-28T22:59:42.815Z"
tags: ["post","link","werd-io","web-sharing","open-web","sharing-tools","share-openly"]
---

{%image src="https://storage.googleapis.com/download/storage/v1/b/jpoehnelt-blog/o/n8n%2F3e8b4672336f34841970c0823a850ae6.png?generation=1711667027057938&alt=media", alt="Share Openly" %}

> If it’s on a “well-known” domain — eg, facebook.com — it’ll send you to the share page there.
It checks to see if it can figure out if the site is on a known platform (currently Mastodon, Known, hosted WordPress, micro.blog, and a few others). If so — hooray! — it knows the share URL, and off you go.
It looks for a <link rel=“share-url”> header tag on the page. The href attribute should be set to the share URL for the site, with template variables {text} and (optionally) {url} present where the share text and URL should go. (If {url} is not present, the URL to share will be appended at the end of the text.) If it’s there — yay! — we forward there, replacing {text} and {url} as appropriate.

I've been looking for ways to improve sharing to the open web and this tool looks neat. Wish the source code was available though!

https://shareopenly.org/

From: [https://werd.io/2024/share-openly](https://werd.io/2024/share-openly)