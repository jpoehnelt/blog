/**
 * Wraps the `UrlFetchApp.fetch()` method to always add the
 * Oauth access token in the header 'Authorization: Bearer TOKEN'.
 *
 * @params {string} url
 * @params {Object=} params
 * @returns {UrlFetchApp.HTTPResponse}
 */
function fetchWithOauthAccessToken__(url, params = {}) {
  const token = ScriptApp.getOAuthToken();

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-type": "application/json",
  };

  params.headers = params.headers ?? {};
  params.headers = { ...headers, ...params.headers };

  return UrlFetchApp.fetch(url, params);
}
