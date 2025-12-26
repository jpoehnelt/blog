/**
 * Generates an access token using impersonation. Requires the following:
 *
 * - Service Account Token Creator
 * - IAM Credentials API
 *
 * @params {string} serviceAccountEmail
 * @params {Array<string>} scope
 * @params {string} [lifetime="3600s"]
 * @returns {string}
 */
function generateAccessTokenForServiceAccount(
  serviceAccountEmailOrId,
  scope,
  lifetime = "3600s", // default
) {
  const host = "https://iamcredentials.googleapis.com";
  const url = `${host}/v1/projects/-/serviceAccounts/${serviceAccountEmailOrId}:generateAccessToken`;

  const payload = {
    scope,
    lifetime,
  };

  const options = {
    method: "POST",
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
    contentType: "application/json",
    muteHttpExceptions: true,
    payload: JSON.stringify(payload),
  };

  const response = UrlFetchApp.fetch(url, options);

  if (response.getResponseCode() < 300) {
    return JSON.parse(response.getContentText()).accessToken;
  } else {
    throw new Error(response.getContentText());
  }
}
