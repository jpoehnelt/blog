function callGoogleApi() {
  // Use httpbin to verify the Authorization header
  const url = "https://httpbin.org/bearer";

  // Truncate the token for security in this example
  const token = ScriptApp.getOAuthToken().slice(0, 5);

  if (token) {
    console.log(`Token: ${token}`);
  }

  const response = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  console.log(response.getContentText());
}
