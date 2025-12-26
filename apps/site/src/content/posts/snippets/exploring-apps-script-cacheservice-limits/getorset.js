function getOrSet(key, fetcher, ttl) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(key);
  if (cached) return JSON.parse(cached);

  const data = fetcher(); // Run the expensive operation
  if (data) cache.put(key, JSON.stringify(data), ttl || 600);
  return data;
}
