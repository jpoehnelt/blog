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
