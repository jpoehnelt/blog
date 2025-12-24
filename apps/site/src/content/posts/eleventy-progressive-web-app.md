---
title: Eleventy Progressive Web App
description: Catching the Eleventy Lighthouse obsession bug!
pubDate: "2022-03-31"
tags:
  - code
  - eleventy
  - pwa
  - progressive web app
  - service worker
  - performance
  - lighthouse
  - blog
---

<script>
  import img_pwa_lighthouse_png from "$lib/images/pwa-lighthouse.png?enhanced";
  import Image from '$lib/components/content/Image.svelte';
</script>

## Lighthouse Obsession

I have caught the [Eleventy Lighthouse obsession bug](https://www.11ty.dev/speedlify/)! Most of the pages on this site score "Four Hundos" with [Lighthouse](https://developers.google.com/web/tools/lighthouse), but I only recently added a service worker to get an installable [Progressive Web App (PWA)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps).

> Progressive Web Apps (PWAs) are web apps that use service workers, manifests, and other web-platform features in combination with progressive enhancement to give users an experience on par with native apps.

## Some Code

The code is fairly simple, especially with the `eleventy.after` event. Basically, there are two parts:

1. Register the worker in your page.
2. Use [workbox-build](https://www.npmjs.com/package/workbox-build) to generate the service worker.

### Register Worker

The following snippet should be added to your base layout or template.

```html
<script>
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
</script>
```

Note the path used is `/sw.js`. This needs to match below!

### Generate Service Worker

Install the [workbox-build](https://www.npmjs.com/package/workbox-build) package.

> The workbox-build module integrates into a node-based build process and can generate an entire service worker, or just generate a list of assets to precache that could be used within an existing service worker.

```bash
npm i -D workbox-build
```

The following should be added to your `eleventy.js` config file. Check out all the [options for `generateSW`](https://developer.chrome.com/docs/workbox/reference/workbox-build/#type-GenerateSWOptions).

```js
// eleventy.js
const workbox = require("workbox-build");

module.exports = (eleventyConfig) => {
  eleventyConfig.on("eleventy.after", async () => {
    // see https://developer.chrome.com/docs/workbox/reference/workbox-build/#type-GenerateSWOptions
    const options = {
      cacheId: "sw",
      skipWaiting: true,
      clientsClaim: true,
      swDest: `public/sw.js`, // TODO change public to match your dir.output
      globDirectory: "public", // TODO change public to match your dir.output
      globPatterns: [
        "**/*.{html,css,js,mjs,map,jpg,png,gif,webp,ico,svg,woff2,woff,eot,ttf,otf,ttc,json}",
      ],
      runtimeCaching: [
        {
          urlPattern:
            /^.*\.(html|jpg|png|gif|webp|ico|svg|woff2|woff|eot|ttf|otf|ttc|json)$/,
          handler: `StaleWhileRevalidate`,
        },
      ],
    };

    await workbox.generateSW(options);
  });

  return {
    dir: {
      output: "public", // TODO update this
    },
  };
};
```

There are some old plugins for Eleventy to help with this, although I don't really see the value. And they use hacky solutions that predate the `eleventy.after` hook.

### Fix your web manifest

I said there were only two steps, but there is a third! You will need a [Web Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest). This is very custom to your site. I use Eleventy to generate from a JavaScript template using global data values.

## Perfect results

And here it is!

<Image src={img_pwa_lighthouse_png} alt="Perfect Lighthouse score with PWA" />

The service worker preloading and caching almost the entire site makes for an amazingly responsive experience. The obsession is worth it!
