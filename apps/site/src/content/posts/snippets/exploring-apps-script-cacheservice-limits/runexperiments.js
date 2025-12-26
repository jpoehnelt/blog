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
