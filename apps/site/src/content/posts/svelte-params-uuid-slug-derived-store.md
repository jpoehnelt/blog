---
title: "SvelteKit: Convert base64 slugs to UUIDs automatically in a derived store"
description: >-
  A SvelteKit store that automatically converts slugs to UUIDs from the URL path
  parameters.
pubDate: "2024-03-31"
tags:
  - code
  - svelte
  - sveltekit
  - uuid
  - slug
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
</script>

Sometimes UUIDs are used as unique identifiers in URLs, but their length is not very user-friendly. A common pattern is to use a string encoding of the UUID to shorten the URL. This post will show how to apply that conversion in a SvelteKit store.

<Note>

URL safe base 64 encoding uses the following characters: `A-Z`, `a-z`, `0-9`, `-`, and `_`. The padding character `=` is not used and the characters `+` and `/` are replaced with `-` and `_` respectively. See RFC 4648, sec. 5.

</Note>

## UUID to Slug and Slug to UUID

Here is a simple implementation of the conversion functions. The `uuid` package is used to parse and stringify UUIDs. The `Buffer` class is used to convert between byte arrays and base 64 strings. If `Buffer` is not available, the `btoa` and `atob` functions are used instead.

<Snippet src="./snippets/svelte-params-uuid-slug-derived-store/uuidtoslug.js" />

## A Parameters Store

In my SvelteKit application I am using the following folder structure for parameters:

```
src
└── routes
	└── [fooId]
		└── +page.svelte
```

The `+page.svelte` component is used to display the content of a page. The `fooId` path parameter is a UUID that is converted to a slug in the URL. The `params` store is used to convert the slugs back to UUIDs.

In this example, logic is applied to specifically convert slugs that are 22 characters long and conclude with `Id` or `id`. You might need to modify this logic to align with your specific use case.

<Snippet src="./snippets/svelte-params-uuid-slug-derived-store/params.js" />

The Regex match above should match the following examples:

- `id` ✅
- `fooId` ✅
- `foo` ❌
- `fooid` ❌

## Using the Parameters Store

The `params` store is imported in the `+page.svelte` component to access the UUIDs.

<Snippet src="./snippets/svelte-params-uuid-slug-derived-store/example.html" />

The above code will show the following output:

```js
uuid: 376a4cca-9431-44f0-bc04-054faffba9b1, slug: N2pMypQxRPC8BAVPr_upsQ
```

## Conclusion

This post showed how to convert slugs to UUIDs in a SvelteKit store. The `params` store can be used to automatically convert slugs in the URL path parameters. This is useful when UUIDs are used as unique identifiers in URLs, but their length is not very user-friendly.

While I plan to use this technique, I might also consider using a more user-friendly slug in the URL as a unique key in the database. This would allow me to use the slug directly in the URL without the need for conversion but at the cost of an additional database lookup.
