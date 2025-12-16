---
title: Google Cloud Region Latency in Google Apps Script
description: >-
  Ping results to Google Cloud regions and  short code snippet demonstrating how
  to measure latency from Google Apps Script.
pubDate: "2024-03-15"
tags: "code,google,google workspace,apps script,google cloud,ping,latency,gcping"
---

Ever wonder what the ping time is to Google Cloud regions from Google Apps Script? Here are the results for my Apps Script project with the default project id. Timezone is set to `America/Denver`, but I don't think that matters!

Here is a short and sweet snippet for measuring latency to Google Cloud regions in Google Apps Script.

```javascript
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
```

This is a followup on the work done by [GCPing](https://gcping.com/) and [Ivan Kutil](https://www.kutil.org/2019/06/how-to-measure-latency-between-google.html) in 2019.
