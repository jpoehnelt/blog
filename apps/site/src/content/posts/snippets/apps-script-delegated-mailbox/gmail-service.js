// Store these in Script Properties, NOT in code
const SERVICE_ACCOUNT_EMAIL = PropertiesService
  .getScriptProperties()
  .getProperty('SERVICE_ACCOUNT_EMAIL');

const PRIVATE_KEY = PropertiesService
  .getScriptProperties()
  .getProperty('PRIVATE_KEY');

/**
 * Creates an OAuth2 service for a specific user's Gmail.
 * @param {string} userEmail - The email to impersonate
 * @returns {OAuth2.Service} The configured service
 */
function getGmailService(userEmail) {
  return OAuth2.createService('Gmail:' + userEmail)
    .setTokenUrl('https://oauth2.googleapis.com/token')
    .setPrivateKey(PRIVATE_KEY)
    .setIssuer(SERVICE_ACCOUNT_EMAIL)
    .setSubject(userEmail)  // The user to impersonate
    .setPropertyStore(PropertiesService.getScriptProperties())
    .setScope('https://www.googleapis.com/auth/gmail.readonly');
}

/**
 * Makes an authenticated request to the Gmail API.
 * @param {string} userEmail - The mailbox to access
 * @param {string} endpoint - API endpoint (e.g., 'messages')
 * @param {Object} params - Query parameters
 * @returns {Object} API response
 */
function gmailApiRequest(userEmail, endpoint, params = {}) {
  const service = getGmailService(userEmail);

  if (!service.hasAccess()) {
    throw new Error('Failed to get access token: ' + service.getLastError());
  }

  const query = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

  const url = `https://gmail.googleapis.com/gmail/v1/users/me/${endpoint}` +
    (query ? `?${query}` : '');

  const response = UrlFetchApp.fetch(url, {
    headers: { Authorization: 'Bearer ' + service.getAccessToken() },
    muteHttpExceptions: true
  });

  return JSON.parse(response.getContentText());
}
