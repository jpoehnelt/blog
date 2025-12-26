/**
 * Demonstrates the power of fetchAll.
 *
 * Sequential: ~10 seconds (1s per request)
 * Parallel: ~1.2 seconds (Total)
 */
// [START benchmark]
function benchmarkParallelism() {
  const requests = [];
  for (let i = 0; i < 10; i++) {
    requests.push({
      url: "https://httpbin.org/delay/1",
      muteHttpExceptions: true,
    });
  }

  // Fast - executes in ~1 second total
  const responses = UrlFetchApp.fetchAll(requests);
}
// [END benchmark]
