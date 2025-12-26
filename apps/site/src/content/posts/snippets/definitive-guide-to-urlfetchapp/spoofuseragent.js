function spoofUserAgent() {
  const url = "https://httpbin.org/user-agent";
  const response = UrlFetchApp.fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/120.0.0.0 Safari/537.36",
    },
  });
  console.log(response.getContentText());
}
