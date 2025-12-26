/**
 * Sends text to Model Armor, checks for violations, and applies redactions.
 * @param {string} text - The user input or content to sanitize.
 * @return {string} - The sanitized/redacted text.
 */
function safeUserText(text) {
  const template = `projects/${PROJECT_ID}/locations/${LOCATION}/templates/${TEMPLATE_ID}`;
  const url = `https://modelarmor.${LOCATION}.rep.googleapis.com/v1/${template}:sanitizeUserPrompt`;

  const payload = {
    userPromptData: { text },
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
    payload: JSON.stringify(payload),
  };

  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());

  // Inspect the filter results
  const filterResults = result.sanitizationResult.filterResults || {};

  // A. BLOCK: Throw errors on critical security violations (e.g., Jailbreak, RAI)
  const securityFilters = {
    pi_and_jailbreak: "piAndJailbreakFilterResult",
    malicious_uris: "maliciousUriFilterResult",
    rai: "raiFilterResult",
    csam: "csamFilterFilterResult",
  };

  for (const [filterKey, resultKey] of Object.entries(securityFilters)) {
    const filterData = filterResults[filterKey];
    if (filterData && filterData[resultKey]?.matchState === "MATCH_FOUND") {
      console.error(filterData[resultKey]);
      throw new Error(`Security Violation: Content blocked.`);
    }
  }

  // B. REDACT: Handle Sensitive Data Protection (SDP) findings
  const sdpResult = filterResults.sdp?.sdpFilterResult?.inspectResult;

  if (
    sdpResult &&
    sdpResult.matchState === "MATCH_FOUND" &&
    sdpResult.findings
  ) {
    // If findings exist, pass them to the low-level helper
    return redactText(text, sdpResult.findings);
  }

  // Return original text if clean
  return text;
}
