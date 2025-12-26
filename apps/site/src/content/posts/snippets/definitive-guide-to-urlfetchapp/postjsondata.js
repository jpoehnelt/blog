function postJsonData() {
  const url = "https://httpbin.org/post";
  const payload = {
    status: "active",
    count: 42,
  };

  const response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    // Critical: Must be a string
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  console.log(response.getContentText());
}
