function callExternalApi() {
  const url = "https://httpbin.org/bearer";
  const apiKey = PropertiesService.getScriptProperties().getProperty("API_KEY");

  if (!apiKey) {
    throw new Error("Script property API_KEY is not set");
  }

  // Log truncated key for verification
  console.log(`Key: ${apiKey.slice(0, 3)}...`);

  const response = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  console.log(response.getContentText());
}
