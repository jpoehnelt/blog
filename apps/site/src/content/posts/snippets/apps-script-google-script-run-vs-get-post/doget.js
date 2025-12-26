function doGet(e) {
  if (e.parameter.action === "read") {
    return ContentService.createTextOutput(
      JSON.stringify(readData()),
    ).setMimeType(ContentService.MimeType.JSON);
  } else {
    // return the HTML file, index.html in this case
    return HtmlService.createHtmlOutputFromFile("index");
  }
}
