const doc = DocumentApp.openById(ID);

const blob = UrlFetchApp.fetch(
  `https://docs.google.com/feeds/download/documents/export/Export` +
    `?id=${doc.getId()}&exportFormat=docx`,
  {
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
  },
).getBlob();

const folder = DriveApp.getFileById(ID).getParents().next();
const docx = folder.createFile(
  doc.getName().replace(".docx", ""),
  blob,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
);

console.log(docx.getId());
