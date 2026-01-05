---
title: Google Maps React Wrapper
description: A wrapper for loading Google Maps JavaScript in React
pubDate: "2021-09-17"
tags:
  - code
  - google maps
  - javascript
  - react
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from "$lib/components/content/Note.svelte";
</script>

<Note>

Update: This library has been archived. We recommend all users to switch to the new [@vis.gl/react-google-maps](https://www.npmjs.com/package/@vis.gl/react-google-maps), which provides a collection of components and hooks and can be configured to be fully compatible with this package.

</Note>

The package [@googlemaps/react-wrapper](https://www.npmjs.com/package/@googlemaps/react-wrapper) is a wrapper component that helps load the Google Maps JavaScript API. Below is a short snippet demonstrating usage.

<Snippet src="./snippets/google-maps-react-wrapper/render.tsx" />

Recently I livecoded its usage and created `google.maps.Map` and `google.maps.Marker` components.

<iframe width="560" height="315" src="https://www.youtube.com/embed/Xwcud1Qnnsw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

If you have any questions about its usage, please feel free to open an issue on [GitHub](https://github.com/googlemaps/react-wrapper/issues).
