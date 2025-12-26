function main() {
  // ... existing code ...

  // Use Google Cloud secret manager
  // Store the CLOUD_PROJECT_ID in Script Properties to keep the code clean
  const projectId =
    PropertiesService.getScriptProperties().getProperty("CLOUD_PROJECT_ID");
  if (!projectId) {
    throw new Error(
      "Script property 'CLOUD_PROJECT_ID' is not set. Please add it to Project Settings.",
    );
  }
  const MY_SECRET = getSecret(projectId, "MY_SECRET");

  console.log(MY_SECRET);
}

/**
 * Fetches a secret from Google Cloud Secret Manager.
 * @param {string} project - The Google Cloud Project ID
 * @param {string} name - The name of the secret
 * @param {string|number} version - The version of the secret (default: 'latest')
 * @returns {string} The decoded secret value
 */
function getSecret(project, name, version = "latest") {
  const cache = CacheService.getScriptCache();
  const cacheKey = `secret.${name}.${version}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const endpoint = `projects/${project}/secrets/${name}/versions/${version}:access`;
  const url = `https://secretmanager.googleapis.com/v1/${endpoint}`;

  const response = UrlFetchApp.fetch(url, {
    headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
    muteHttpExceptions: true,
  });

  if (response.getResponseCode() >= 300) {
    throw new Error(`Error fetching secret: ${response.getContentText()}`);
  }

  // Secrets are returned as base64 strings, so we must decode them
  const encoded = JSON.parse(response.getContentText()).payload.data;
  const decoded = Utilities.newBlob(
    Utilities.base64Decode(encoded),
  ).getDataAsString();

  // Cache for 5 minutes (300 seconds)
  cache.put(cacheKey, decoded, 300);
  return decoded;
}
