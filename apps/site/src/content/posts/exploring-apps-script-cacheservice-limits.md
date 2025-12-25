---
title: "Exploring Apps Script CacheService Limits"
description: "A deep dive into Apps Script CacheService limits. I verify key/value constraints and uncover the undocumented FIFO batch eviction policy at the 1000-item limit."
pubDate: "2025-12-22"
tags:
  [
    "apps script",
    "cacheservice",
    "google workspace",
    "fifo",
    "cache",
    "performance",
    "limits",
  ]
syndicate: true
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
  import Note from "$lib/components/content/Note.svelte";
</script>

<Note>
This script uses `try...catch` blocks aggressively to capture the exact error messages thrown by the CacheService.
</Note>

```javascript
/**
 * This is our main test runner. It executes the four experiments sequentially
 * and collates the results into a table.
 */
function runExperiments() {
  const cache = CacheService.getScriptCache();
  const results = [];

  console.log("=== Starting CacheService Limit Tests ===");

  testKeyLength(cache, results);
  testValueSize(cache, results);
  testEdgeCases(cache, results);
  testCacheEviction(cache, results);

  console.log(""); // Spacing
  console.log("📊 Summary Table");
  // console.table is not available in Apps Script, so we do it manually
  console.log("Test             | Result");
  results.forEach((r) => {
    console.log(`${r.Test.padEnd(16)} | ${r.Result}`);
  });
}

/**
 * Experiment 1: Key Length
 * I use a binary search here because I'm impatient. We want to find the EXACT
 * character count where it breaks.
 */
function testKeyLength(cache, results) {
  console.log("📏 [Test 1] Key Length Limit");
  const VAL = "A";
  let low = 200,
    high = 300;
  let maxLen = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const key = "k".repeat(mid);
    try {
      cache.put(key, VAL, 1);
      // It worked! Let's push our luck...
      maxLen = mid;
      low = mid + 1;
      cache.remove(key);
    } catch (e) {
      // Oops, too far. Back it up.
      high = mid - 1;
    }
  }
  console.log(`> Max Key Length: ${maxLen} characters`);
  results.push({ Test: "Key Limit", Result: `${maxLen} chars` });
}

/**
 * Experiment 2: Value Size
 * Documentation says 100KB. Let's see if that's 100 * 1024 or something else.
 */
function testValueSize(cache, results) {
  console.log("📦 [Test 2] Value Size Limit");
  const KEY = "size_test";
  // The boundary we suspect (100KB)
  const sizes = [102400, 102401];

  sizes.forEach((size) => {
    try {
      const value = "x".repeat(size);
      cache.put(KEY, value, 1);
      console.log(`> ${size} bytes: OK`);
      if (size === 102400)
        results.push({ Test: "Max Value", Result: "100KB (102,400 bytes)" });
    } catch (e) {
      console.log(`> ${size} bytes: FAILED (${e.message})`);
    } finally {
      cache.remove(KEY);
    }
  });
}

/**
 * Experiment 3: Edge Cases
 * What happens when we throw garbage at the cache?
 * Does it explode or just do something unexpected?
 */
function testEdgeCases(cache, results) {
  console.log("🧪 [Test 3] Edge Cases");

  const cases = [
    { name: "Null Key", args: [null, "val", 1] },
    { name: "Empty Key", args: ["", "val", 1] },
    // Should coerce to "123"
    { name: "Number Key", args: [123, "val", 1] },
    // Should fail (not a string)
    { name: "Object Value", args: ["key", { a: 1 }, 1] },
    { name: "Null Value", args: ["key", null, 1] },
    // Should be ignored
    { name: "Neg Expiration", args: ["key", "val", -1] },
  ];

  cases.forEach((c) => {
    try {
      cache.put(...c.args);
      console.log(`> ${c.name}: Accepted`);

      // Verify what was actually stored
      const key = c.args[0];
      if (key !== null && key !== undefined && key !== "") {
        const retrieved = cache.get(String(key));
        console.log(`  -> Stored Value: "${retrieved}"`);
        results.push({ Test: c.name, Result: `Stored: "${retrieved}"` });
      } else {
        results.push({ Test: c.name, Result: "Accepted (Ignored)" });
      }
    } catch (e) {
      console.log(`> ${c.name}: Threw "${e.message}"`);
      results.push({ Test: c.name, Result: `Error: ${e.message}` });
    } finally {
      cache.remove(String(c.args[0]));
    }
  });
}

/**
 * Experiment 4: The 1000-Item Cliff (Robust Version)
 * We fill the cache, then explicitly "refresh" the oldest items by reading them.
 * Then we trigger a mass overflow.
 *
 * IF Oldest items die -> FIFO (Creation time matters)
 * IF Oldest items survive -> LRU (Access time matters)
 */
function testCacheEviction(cache, results) {
  console.log("🗑️ [Test 4] Robust Eviction Policy Test");
  const runId = Math.random().toString(36).slice(2);
  const prefix = `evict_${runId}_`;

  // 1. Fill to Capacity (1000 items)
  // We use putAll in batches for speed (1000 individual puts is slow)
  console.log("> Filling cache with 1000 items...");
  const allKeys = [];
  let batch = {};

  for (let i = 0; i < 1000; i++) {
    // "i" represents creation order (0 is oldest)
    const key = prefix + i;
    allKeys.push(key);
    batch[key] = "payload";

    // Write in chunks of 100 to avoid execution time limits
    if (Object.keys(batch).length === 100) {
      cache.putAll(batch, 600);
      batch = {};
    }
  }
  // catch any stragglers
  if (Object.keys(batch).length > 0) cache.putAll(batch, 600);

  // 2. The Trap: Touch the "Oldest" items
  // We read the first 100 items (indices 0-99).
  // In a FIFO system, these are the oldest and should die first.
  // In an LRU system, we just made them 'fresh', so they should survive.
  console.log("> Reading keys 0-99 to update 'Last Accessed' time...");
  const oldestKeys = allKeys.slice(0, 100);
  cache.getAll(oldestKeys);

  // 3. Apply Pressure
  // Insert 50 new items to force the cache to make room.
  // We go well over the limit to trigger immediate cleanup.
  console.log("> Inserting 50 overflow items...");
  for (let i = 0; i < 50; i++) {
    cache.put(`${prefix}overflow_${i}`, "overflow", 600);
  }

  // 4. Forensics
  // We check which of the original 1000 are missing.
  const storedMap = cache.getAll(allKeys);
  const missingKeys = allKeys.filter((k) => storedMap[k] === undefined);

  console.log(`> Evicted Count: ${missingKeys.length} items`);

  let policy = "Unknown";
  let detail = "";

  if (missingKeys.length === 0) {
    policy = "Soft Limit / Elastic";
    detail = "The cache absorbed 1050 items without complaining.";
  } else {
    // Analyze WHO went missing.
    // Did the "oldest but recently touched" (0-99) get deleted?
    const touchedMissing = missingKeys.filter((k) => {
      const index = parseInt(k.split(prefix)[1]);
      return index < 100;
    });

    const untouchedMissing = missingKeys.filter((k) => {
      const index = parseInt(k.split(prefix)[1]);
      return index >= 100;
    });

    console.log(`  -> Missing "Touched" (Oldest): ${touchedMissing.length}`);
    console.log(`  -> Missing "Untouched" (Newer): ${untouchedMissing.length}`);

    if (touchedMissing.length > 20) {
      // We allow some fuzziness, but if many touched items are gone, it's FIFO.
      policy = "FIFO (First-In-First-Out)";
      detail = "Oldest items were evicted despite recent activity.";
    } else if (untouchedMissing.length > 0 && touchedMissing.length === 0) {
      // The touched items survived, the middle ones died.
      policy = "LRU (Least Recently Used)";
      detail = "Recently accessed items were spared.";
    } else {
      policy = "Random / Mixed";
      detail = "Eviction pattern appears non-deterministic.";
    }
  }

  console.log(`> Conclusion: ${policy}`);
  console.log(`> Note: ${detail}`);
  results.push({ Test: "Eviction Policy", Result: policy });

  // Cleanup (Optional - helps subsequent runs)
  try {
    cache.removeAll(allKeys);
  } catch (e) {}
}
```

## Results & Analysis

Here is the raw output from a full run of the script:

```text
=== Starting CacheService Limit Tests ===
📏 [Test 1] Key Length Limit
> Max Key Length: 250 characters
📦 [Test 2] Value Size Limit
> 102400 bytes: OK
> 102401 bytes: FAILED (Argument too large: value)
🧪 [Test 3] Edge Cases
> Null Key: Threw "Invalid argument: key"
> Empty Key: Threw "Invalid argument: key"
> Number Key: Accepted
  -> Stored Value: "val"
> Object Value: Accepted
  -> Stored Value: "[object Object]"
> Null Value: Accepted
  -> Stored Value: "null"
> Neg Expiration: Accepted
  -> Stored Value: "val"
🗑️ [Test 4] Robust Eviction Policy Test
> Filling cache with 1000 items...
> Reading keys 0-99 to update 'Last Accessed' time...
> Inserting 50 overflow items...
> Evicted Count: 101 items
  -> Missing "Touched" (Oldest): 100
  -> Missing "Untouched" (Newer): 1
> Conclusion: FIFO (First-In-First-Out)
> Note: Oldest items were evicted despite recent activity.

📊 Summary Table
Test             | Result
-----------------|--------------------------------
Key Limit        | 250 chars
Max Value        | 100KB (102,400 bytes)
Null Key         | Error: Invalid argument: key
Empty Key        | Error: Invalid argument: key
Number Key       | Stored: "val"
Object Value     | Stored: "[object Object]"
Null Value       | Stored: "null"
Neg Expiration   | Stored: "val"
Eviction Policy  | FIFO (Batch Eviction)
```

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

```text
[Item Count]
     |
1050 |      / (Overflow added)
     |     /
1000 |----/   <-- High Water Mark (Limit Triggered)
     |   |
     |   |    (Batch Eviction: ~100 items deleted instantly)
 900 |___|    <-- Low Water Mark (Safety Buffer)
     |
     +----------------------> [Time]
```

**The Math:**
In our test, we had 1,000 items and added 50 more. The system evicted **101 items** instantly, dropping the total to 949.

**The Takeaway:**
When you hit the limit, you don't just lose one item. You lose a **block** of roughly ~10% of your oldest data instantly.

**The Warning**: If you rely on `getAll` fetching a complete set of keys you just stored, you might find holes if you crossed the 1000-item boundary.

## Best Practices

To build robust applications within these **Apps Script CacheService limits**, adopt these architectural patterns:

### 1. The "Cache-Aside" Pattern

Never assume data is in the cache. Implement a wrapper that accepts a "fetcher" function. If the cache misses, it runs the fetcher, stores the result, and returns it.

```javascript
function getOrSet(key, fetcher, ttl) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(key);
  if (cached) return JSON.parse(cached);

  const data = fetcher(); // Run the expensive operation
  if (data) cache.put(key, JSON.stringify(data), ttl || 600);
  return data;
}
```

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

```javascript
/**
 * Refreshes a key's position in the FIFO queue.
 * Use this for "hot" items you don't want evicted.
 */
function refreshKey(cache, key, expirationInSeconds) {
  const value = cache.get(key);
  if (value) {
    // Apps Script Cache is FIFO. To "refresh" an item (LRU style),
    // we must remove and re-insert it to make it the "newest".
    cache.remove(key);
    cache.put(key, value, expirationInSeconds || 600);
  }
}
```

### 6. Concurrency & Safety

- **Hash Your Keys**: Use `Utilities.computeDigest` to ensure keys stay under 250 characters.
- **Use LockService**: Cache writes are not atomic. Wrap Read-Modify-Write operations (like counters) in `LockService.getScriptLock()` to prevent race conditions.

## Related Articles

- [Key Value Store Options in Google Apps Script](/posts/apps-script-key-value-stores) - A comparison of CacheService, PropertiesService, and Firestore.
- [Memoization in Apps Script](/posts/apps-script-memoization) - Using CacheService to speed up expensive function calls.
- [Apps Script V8 Runtime Limitations](/posts/apps-script-runtime-limitations-wintercg) - A broader look at Javascript runtime constraints.
- [Secure Secrets in Google Apps Script](/posts/secure-secrets-google-apps-script) - How to safely cache secrets to avoid rate limits when using Cloud Secrets Manager.
