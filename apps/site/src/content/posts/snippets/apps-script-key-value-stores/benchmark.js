function runBenchmark() {
  const iterations = 100;
  const payload = "x".repeat(100); // 100 bytes
  
  // Benchmark CacheService
  const cacheFn = () => {
    const cache = CacheService.getScriptCache();
    cache.put("benchmark_test", payload, 10);
    cache.get("benchmark_test");
  };
  
  // Benchmark PropertiesService
  const propsFn = () => {
    const props = PropertiesService.getScriptProperties();
    props.setProperty("benchmark_test", payload);
    props.getProperty("benchmark_test");
  };

  const cacheTime = timeExecution(cacheFn, iterations);
  const propsTime = timeExecution(propsFn, iterations);

  Logger.log(`CacheService (Avg/Op): ${cacheTime.toFixed(2)}ms`); // ~15-20ms
  Logger.log(`PropertiesService (Avg/Op): ${propsTime.toFixed(2)}ms`); // ~150-200ms
}

function timeExecution(fn, iterations) {
  const start = new Date().getTime();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = new Date().getTime();
  return (end - start) / iterations;
}
