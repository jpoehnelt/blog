/**
 * Wraps UrlFetchApp with exponential backoff logic.
 * Essential for handling 429s and "Address Unavailable" errors.
 */
function fetchWithRetry(url, params = {}) {
  const fetchParams = {
    ...params,
    muteHttpExceptions: true,
  };
  const maxRetries = 3;
  let attempt = 0;

  while (attempt <= maxRetries) {
    let response;
    try {
      response = UrlFetchApp.fetch(url, fetchParams);
    } catch (e) {
      console.warn(`Attempt ${attempt + 1} failed: ${e}`);
      if (attempt === maxRetries) throw e;
    }

    if (response) {
      const code = response.getResponseCode();
      // Return if success (2xx) or permanent error (4xx but not 429)
      if (
        code < 400 ||
        (code >= 400 && code < 500 && code !== 429)
      ) {
        return response;
      }
      console.warn(
        `Attempt ${attempt + 1} status: ${code}`,
      );
    }

    if (attempt === maxRetries) {
      if (response) return response;
      throw new Error("Max retries reached");
    }

    // Exponential backoff + Jitter
    const jitter = Math.round(Math.random() * 500);
    const exponentialBackoffMs =
      Math.pow(2, attempt + 1) * 1000 + jitter;
    let sleepMs = exponentialBackoffMs;

    if (response) {
      const headers = response.getAllHeaders();
      let retryAfter = headers["Retry-After"];

      if (Array.isArray(retryAfter)) {
        retryAfter = retryAfter[0];
      }

      if (retryAfter) {
        const retrySeconds = parseInt(retryAfter, 10);
        if (!isNaN(retrySeconds)) {
          sleepMs = retrySeconds * 1000;
        }
      }
    }

    Utilities.sleep(sleepMs);
    attempt++;
  }
}
