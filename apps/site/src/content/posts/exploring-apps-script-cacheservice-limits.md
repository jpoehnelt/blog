---
title: "Apps Script CacheService: Unofficial Documentation and Limits"
description: "The unofficial documentation for the Apps Script CacheService.
  Learn about key/value constraints, size limits, and the undocumented FIFO
  batch eviction policy."
pubDate: "2025-12-22"
tags:
  - "apps script"
  - "cacheservice"
  - "google workspace"
  - "fifo"
  - "cache"
  - "performance"
  - "limits"
  - "documentation"
  - "code"
faq:
  - question: "What is the key length limit for CacheService?"
    answer:
      "I've tested this, and the key length is a hard 250 characters. If your
      key is even one character over, it will throw an error."
  - question: "What is the value size limit for CacheService?"
    answer: "The documentation says 100KB, and my tests confirm it. The limit is
      exactly 102,400 bytes, and like the key length, it's a hard limit."
  - question: "What is the eviction policy for CacheService?"
    answer: "This is a critical one I discovered. The CacheService uses a FIFO
      (First-In, First-Out) policy. This means when the cache is full (at 1000
      items), it doesn't just remove the oldest item; it removes a whole batch
      of the oldest items, around 10% of the cache."
  - question: "What is the difference between getScriptCache() and getUserCache()?"
    answer: "This is a huge distinction. getScriptCache() is shared by everyone
      using your script, so if you have multiple users, they can overwrite each
      other's data. I always use getUserCache() for user-specific data to keep
      it safe and separate."
  - question: "How should I handle large payloads with CacheService?"
    answer:
      "I can't store anything over 100KB directly. My strategy for this is to
      chunk the data into smaller pieces, like 90KB each, and store them with
      separate keys. I then use a 'manifest' key to keep track of the chunks so
      I can put them back together later."
  - question: "How can I prevent hitting the CacheService rate limits?"
    answer: "To avoid hitting rate limits, I always use batch operations like
      getAll() and putAll(). I also use a 'cache-aside' pattern, which means I
      check the cache first, and if the data isn't there, I fetch it and then
      store it in the cache. Adding some 'jitter' (randomness) to the expiration
      times also helps prevent all my cached items from expiring at once."
syndicate: true
devto:
  id: 3121405
  link:
    "https://dev.to/googleworkspace/apps-script-cacheservice-eviction-and-oth\
    er-limits-1p6d"
  status: "published"
medium:
  id: "98d5d9ddf69d"
  link: "https://medium.com/@jpoehnelt/98d5d9ddf69d"
  status: "draft"
---

Caching is a critical strategy for optimizing performance in Google Apps Script properties, especially when dealing with slow APIs or heavy computations. The built-in `CacheService` provides a simple key-value store, but its documentation leaves several "edge cases" and failure scenarios vague.

While the documentation states a **maximum value size of 100KB**, it doesn't explicitly detail what happens when you hit the **Apps Script CacheService key length limit** or throw odd types at it.

In this post, we'll write a script to empirically test these limits—verifying the **Apps Script CacheService key length limit 250** characters theory—and explore how the service behaves under stress.

## Key Findings (TL;DR)

| Feature             | Computed Limit        | Behavior                                                                                                      |
| :------------------ | :-------------------- | :------------------------------------------------------------------------------------------------------------ |
| **Key Length**      | 250 characters        | Strict. Throws error if exceeded.                                                                             |
| **Value Size**      | 100KB (102,400 bytes) | Strict. Throws error if exceeded.                                                                             |
| **Eviction Policy** | **FIFO**              | Removes items based on **creation time**, ignoring recent access. Removes ~100 items (10%) at once when full. |
| **Edge Cases**      | Permissive            | Coerces types to strings. Negative expiration is ignored/stored.                                              |

## The Documentation vs. Reality

According to the official [documentation](https://developers.google.com/apps-script/reference/cache/cache#putkey,-value,-expirationinseconds), we know:

- **Value Limit**: 100KB per value.
- **Expiration**: Max 6 hours (21600 seconds).

However, specific details about the **Apps Script CacheService key length limit of 250 characters** and expected errors for other invalid inputs are less clear. Let's find out exactly where the walls are.

> **Important Distinction:** These limits apply to the specific cache instance you request.
>
> - **`getScriptCache()`**: The 1,000-item limit is **shared** across all users. If you have 50 users adding 20 items each, you will hit the limit and trigger mass evictions immediately.
> - **`getUserCache()`**: The limit applies **per user**, making it much safer for user-specific data (like settings or temporary drafts).

## The Experiment

To explore the **Apps Script CacheService limits**, I wrote a script that attempts to:

1.  Store keys of increasing lengths to find the exact character cutoff.
2.  Store values of increasing sizes to verify the 100KB limit.
3.  Test edge cases like null values, empty strings, and non-string types.

### The "Limit Explorer" Script

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from "$lib/components/content/Note.svelte";
</script>

<Note>
This script uses `try...catch` blocks aggressively to capture the exact error messages thrown by the CacheService.
</Note>

<Snippet src="./snippets/exploring-apps-script-cacheservice-limits/runexperiments.js" />

## Results & Analysis

Here is the raw output from a full run of the script:

<Snippet src="./snippets/exploring-apps-script-cacheservice-limits/example.txt" />

### Analysis 1: The Hard Limits

- **Key Length**: Confirmed strictly at **250 characters**. Keys must be shorter than this.
- **Value Size**: Confirmed strictly at **100KB (102,400 bytes)**. One byte over validates the documented limit.

### Analysis 2: The "Helpful" Edge Cases

Watch out for these footguns, `CacheService` is very permissive:

- **Coercion**: Numbers (`123`) are stringified.
- **Dangerous Acceptance**: Objects (`{a:1}`) are stored as the useless string `"[object Object]"`.
- **Negative Expiration**: Surprisingly, these **persist** in the cache, likely defaulting to a standard duration rather than expiring instantly.

### Analysis 3: The 1000-Item Cliff & Batch Eviction

This is the most critical finding. The official documentation mentions a "maximum of 1000 items", but the behavior is more nuanced.

Our test confirms the eviction policy is **FIFO (First-In, First-Out)**—meaning the items created earliest are the first to be removed. This contrasts with **LRU (Least Recently Used)**, where popular items are kept regardless of age, or **LIFO (Last-In, First-Out)**, which is rarely used for caching.

Apps Script's `CacheService` appears to use a **High Water Mark** (1000 items) and a **Low Water Mark** (e.g. ~900 items).

- **High Water Mark (The Limit):** The 1,000 item cliff. Once hit, it triggers the cleanup.
- **Low Water Mark (The Safety Zone):** The system deletes enough items to get back to a "safe" number so it can accept subsequent writes without thrashing.

<Snippet src="./snippets/exploring-apps-script-cacheservice-limits/example-1.txt" />

**The Math:**
In our test, we had 1,000 items and added 50 more. The system evicted **101 items** instantly, dropping the total to 949.

**The Takeaway:**
When you hit the limit, you don't just lose one item. You lose a **block** of roughly ~10% of your oldest data instantly.

**The Warning**: If you rely on `getAll` fetching a complete set of keys you just stored, you might find holes if you crossed the 1000-item boundary.

## Best Practices

To build robust applications within these **Apps Script CacheService limits**, adopt these architectural patterns:

### 1. The "Cache-Aside" Pattern

Never assume data is in the cache. Implement a wrapper that accepts a "fetcher" function. If the cache misses, it runs the fetcher, stores the result, and returns it.

<Snippet src="./snippets/exploring-apps-script-cacheservice-limits/getorset.js" />

### 2. Prevent "Thundering Herd" with Jitter

If you set a static expiration (e.g., exactly 600s) for a popular resource, it will expire for everyone simultaneously, causing a spike in load. Add randomness ("jitter") to your expiration times.

```javascript
// Instead of exactly 600s, use 540s to 660s
const jitter = Math.floor(Math.random() * 120) - 60;
cache.put(key, value, 600 + jitter);
```

### 3. Batches and Namespaces

- **Batch Operations**: Apps Script is sensitive to latency. Always use `getAll` and `putAll` when processing multiple keys.
- **Namespace Keys**: `getScriptCache()` is global for the script. Prefix keys (e.g., `STAGING_CONFIG:settings`) to prevent collisions between environments or different parts of your app.

### 4. Handling Large Payloads (Chunking)

Since the 100KB limit is strict, you cannot cache large API responses directly.
**Strategy**: Split the string into 90KB chunks (`key_1`, `key_2`) and store a "manifest" key (`key_meta`) to reassemble them. _Warning: Ensure you handle partial cache hits where one chunk is missing._

### 5. Refresh Critical Keys (FIFO Defense)

Since `cache.get()` does not reset the eviction timer (FIFO), you must manually "refresh" hot items by re-writing them.

<Snippet src="./snippets/exploring-apps-script-cacheservice-limits/refreshkey.js" />

### 6. Concurrency & Safety

- **Hash Your Keys**: Use `Utilities.computeDigest` to ensure keys stay under 250 characters.
- **Use LockService**: Cache writes are not atomic. Wrap Read-Modify-Write operations (like counters) in `LockService.getScriptLock()` to prevent race conditions.

## Related Articles

- [Key Value Store Options in Google Apps Script](/posts/apps-script-key-value-stores) - A comparison of CacheService, PropertiesService, and Firestore.
- [Memoization in Apps Script](/posts/apps-script-memoization) - Using CacheService to speed up expensive function calls.
- [Apps Script V8 Runtime Limitations](/posts/apps-script-runtime-limitations-wintercg) - A broader look at Javascript runtime constraints.
- [Secure Secrets in Google Apps Script](/posts/secure-secrets-google-apps-script) - How to safely cache secrets to avoid rate limits when using Cloud Secrets Manager.
- [PostgreSQL from Apps Script](/posts/apps-script-postgresql/) - When you need a real database instead of CacheService.
