---
title: Memoization in Apps Script
description: >-
  A generic Apps Script memoization function can be written to cache any
  function.
pubDate: "2023-12-11"
tags:
  - code
  - google
  - google workspace
  - apps script
  - memoization
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
</script>

<Note>

Update: See [Exploring Apps Script CacheService Limits](/posts/exploring-apps-script-cacheservice-limits) for a deep dive into CacheService behavior and limits.

</Note>

A generic Apps Script memoization function can be written to cache any function. There are two parts to this functionality:

1. Generate a unique key for the function and arguments
2. Cache the result of the function using the [`CacheService`](https://developers.google.com/apps-script/reference/cache/cache-service)

## Generating a unique key

Below is a generic hash function that takes a string and computes a hash using the specified algorithm. The default algorithm is MD5, but can be changed to any of the [`Utilities.DigestAlgorithm`](https://developers.google.com/apps-script/reference/utilities/digest-algorithm) values.

<Snippet src="./snippets/apps-script-memoization/that.js" />

An example output of this function is:

```js
hash("test"); // "CY9rzUYh03PK3k6DJie09g=="
```

The key for the memoization function will be the hash of the function name and arguments. The function name is included to prevent collisions between functions with the same arguments. The arguments are stringified to allow for any type of argument to be passed to the memoized function.

```js
const key = hash(JSON.stringify([func.toString(), ...args]));
```

<Note>

❗ `JSON.stringify` will not work for all types of arguments such as functions, dates, and regex. These types of arguments will need to be handled separately.

</Note>

## Caching the result

The memoization function will first check the cache for the key. If the key exists, the cached value will be returned. If the key does not exist, the function will be called and the result will be cached.

<Snippet src="./snippets/apps-script-memoization/by.js" />

## Limitations

There are some limitations to be aware of when using the CacheService:

- The maximum size of a cached value is 100KB
- The maximum key length is 250 characters
- The maximum number of cached items is 1000.
- Only strings can be stored in the cache. Objects must be stringified before being stored.

Read more about these limitations at [`CacheService.put()`](https://developers.google.com/apps-script/reference/cache/cache#putkey,-value,-expirationinseconds).
