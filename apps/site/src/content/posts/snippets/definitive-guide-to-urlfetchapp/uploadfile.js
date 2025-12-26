function uploadFile() {
  // Create a fake file
  const blob = Utilities.newBlob("Hello World", "text/plain", "test.txt");

  const response = UrlFetchApp.fetch("https://httpbin.org/post", {
    method: "post",
    payload: {
      meta: "metadata_value",
      // Mixing strings and blobs triggers multipart mode
      file: blob,
    },
    muteHttpExceptions: true,
  });

  console.log(response.getContentText());
}
