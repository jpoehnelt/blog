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
