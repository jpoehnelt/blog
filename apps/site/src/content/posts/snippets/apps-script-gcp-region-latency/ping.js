function ping() {
  const endpoints = JSON.parse(
    UrlFetchApp.fetch("https://gcping.com/api/endpoints").getContentText(),
  );
  const results = Object.entries(endpoints).map(([k, v]) => ({
    stats: latency(v.URL),
    endpoint: k,
  }));

  console.log(
    JSON.stringify(
      results.sort((a, b) => a.stats.average - b.stats.average),
      null,
      2,
    ),
  );
}

function latency(url, iterations = 5) {
  console.log(url);
  const executionTimes = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    UrlFetchApp.fetch(url);
    const endTime = performance.now();

    executionTimes.push(endTime - startTime);
  }

  // Calculate statistics
  const min = Math.min(...executionTimes);
  const max = Math.max(...executionTimes);
  const totalTime = executionTimes.reduce((sum, time) => sum + time, 0);
  const average = totalTime / iterations;

  return {
    min: min,
    max: max,
    mean: average,
    median: executionTimes.sort()[Math.floor(executionTimes.length / 2)],
    // times: executionTimes,
  };
}

globalThis.performance = globalThis.performance || {
  offset: Date.now(),
  now: function now() {
    return Date.now() - this.offset;
  },
};
