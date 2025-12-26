function predict(prompt) {
  const BASE = "https://us-central1-aiplatform.googleapis.com";
  const URL = `${BASE}/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL}:predict`;

  const payload = JSON.stringify({
    instances: [{ prompt }],
    parameters: {
      temperature: 0.2,
      maxOutputTokens: 256,
      top: 40,
      topP: 0.95,
    },
  });

  const options = {
    method: "post",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    muteHttpExceptions: true,
    contentType: "application/json",
    payload,
  };

  const response = UrlFetchApp.fetch(URL, options);

  if (response.getResponseCode() == 200) {
    return JSON.parse(response.getContentText());
  } else {
    throw new Error(response.getContentText());
  }
}
