const docx = DriveApp.getFileById(docxId);

const metadata = {
  title: docx.getName().replace(".docx", ""),
  mimeType: "application/vnd.google-apps.document",
  // keep in same folder
  parents: [{ id: docx.getParents().next().getId() }],
};

const id = Drive.Files.create(metadata, docx.getBlob(), { convert: true }).id;

const doc = DocumentApp.openById(id);
