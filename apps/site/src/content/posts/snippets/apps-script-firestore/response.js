class Firestore {
  // ... omitted

  fetch(url, options) {
    options = {
      ...options,
      muteHttpExceptions: true,
    };

    const response = fetchWithOauthAccessToken__(url, options);

    if (response.getResponseCode() < 300) {
      return JSON.parse(response.getContentText());
    } else {
      throw new Error(response.getContentText());
    }
  }
}
