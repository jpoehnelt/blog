function demonstrateMuteHttpExceptions() {
  // Using httpbin to simulate a 404 error
  const response = UrlFetchApp.fetch("https://httpbin.org/status/404", {
    muteHttpExceptions: true,
  });

  if (response.getResponseCode() === 404) {
    console.log("Resource not found, skipping..."); // Graceful handling
  } else if (response.getResponseCode() === 200) {
    // Process success
  }
}
