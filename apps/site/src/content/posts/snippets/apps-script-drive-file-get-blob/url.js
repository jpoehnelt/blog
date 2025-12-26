const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
UrlFetchApp.fetch(url, {
  headers: {
    Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
  },
}).getContent();
