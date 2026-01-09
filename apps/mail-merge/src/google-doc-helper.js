function getGoogleDocContent(docId) {
  const url = `https://docs.google.com/feeds/download/documents/export/Export?id=${docId}&exportFormat=html`;
  const param = {
    method: "get",
    headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
    muteHttpExceptions: true,
  };
  return UrlFetchApp.fetch(url, param).getContentText();
}
