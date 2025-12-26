function manageCookies() {
  // 1. Trigger a response that sets a cookie
  // 'followRedirects: false' is crucial here, otherwise we miss the header
  const setCookie = UrlFetchApp.fetch(
    "https://httpbin.org/cookies/set?session=123",
    { followRedirects: false },
  );

  const headers = setCookie.getAllHeaders();
  let setCookieHeaders = headers["Set-Cookie"] || [];

  // Ensure it's an array, as UrlFetchApp may return a single string
  if (!Array.isArray(setCookieHeaders)) {
    setCookieHeaders = [setCookieHeaders];
  }

  const cookie = setCookieHeaders
    .map((cookieString) => cookieString.split(";")[0])
    .join("; ");

  // 2. Pass that cookie to the next request
  const verify = UrlFetchApp.fetch(
    "https://httpbin.org/cookies",
    {
      headers: { Cookie: cookie },
    },
  );

  console.log(verify.getContentText()); // Shows { "cookies": { "session": "123" } }
}
