---
title: Memoization in Apps Script
description: >-
  A generic Apps Script memoization function can be written to cache any
  function.
pubDate: '2023-12-11'
tags: 'code,google,google workspace,apps script,memoization'
---

<script>
  import Note from '$lib/components/content/Note.svelte';
</script>

A generic Apps Script memoization function can be written to cache any function. There are two parts to this functionality:

1. Generate a unique key for the function and arguments
2. Cache the result of the function using the [`CacheService`](https://developers.google.com/apps-script/reference/cache/cache-service)

## Generating a unique key

Below is a generic hash function that takes a string and computes a hash using the specified algorithm. The default algorithm is MD5, but can be changed to any of the [`Utilities.DigestAlgorithm`](https://developers.google.com/apps-script/reference/utilities/digest-algorithm) values.

```js
/**
 * A generic hash function that takes a string and computes a hash using the
 * specified algorithm.
 *
 * @param {string} str - The string to hash.
 * @param {Utilities.DigestAlgorithm} algorithm - The algorithm to use to
 *  compute the hash. Defaults to MD5.
 * @returns {string} The base64 encoded hash of the string.
 */
function hash(str, algorithm = Utilities.DigestAlgorithm.MD5) {
  const digest = Utilities.computeDigest(algorithm, str);

  return Utilities.base64Encode(digest);
}
```

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

```js
/**
 * Memoizes a function by caching its results based on the arguments passed.
 *
 * @param {Function} func - The function to be memoized.
 * @param {number} [ttl=600] - The time to live in seconds for the cached
 *  result. The maximum value is 600.
 * @param {Cache} [cache=CacheService.getScriptCache()] - The cache to store the
 *  memoized results.
 * @returns {Function} - The memoized function.
 *
 * @example
 *
 * const cached = memoize(myFunction);
 * cached(1, 2, 3); // The result will be cached
 * cached(1, 2, 3); // The cached result will be returned
 * cached(4, 5, 6); // A new result will be calculated and cached
 */
function memoize(func, ttl = 600, cache = CacheService.getScriptCache()) {
  return (...args) => {
    
    // consider a more robust input to the hash function to handler complex
    // types such as functions, dates, and regex
    const key = hash(JSON.stringify([func.toString(), ...args]));

    const cached = cache.get(key);

    if (cached != null) {
      return JSON.parse(cached);
    } else {
      const result = func(...args);
      cache.put(key, JSON.stringify(result), ttl);
      return result;
    }
  };
}
```

## Limitations

There are some limitations to be aware of when using the CacheService:

- The maximum size of a cached value is 100KB
- The maximum key length is 250 characters
- The maximum number of cached items is 1000.
- Only strings can be stored in the cache. Objects must be stringified before being stored.

Read more about these limitations at [`CacheService.put()`](https://developers.google.com/apps-script/reference/cache/cache#putkey,-value,-expirationinseconds).
