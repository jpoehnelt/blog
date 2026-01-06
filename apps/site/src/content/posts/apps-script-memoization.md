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
faq:
  - question: "What is memoization in Apps Script?"
    answer: "I think of memoization as a way to cache the results of a function. In Apps Script, I can write a generic memoization function that takes any function, generates a unique key for it and its arguments, and then uses the CacheService to store the result."
  - question: "How do you generate a unique key for a memoized function?"
    answer: "To generate a unique key, I create a hash from the function's code (by calling func.toString()) and its arguments (which I stringify). This way, the same function with the same arguments will always have the same key."
  - question: "How does the memoization function work?"
    answer: "My memoization function is pretty simple. It first checks the cache to see if a key exists. If it does, I just return the cached value. If not, I call the original function, store its result in the cache with the key, and then return the result."
  - question: "What are the limitations of using CacheService for memoization?"
    answer: "When I use CacheService for memoization, I have to keep its limitations in mind. The big ones are: a max value size of 100KB, a max key length of 250 characters, and a max of 1000 items in the cache. Also, CacheService only stores strings, so I have to remember to stringify any objects."
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
</script>

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
