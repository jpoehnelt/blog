/**
 * Organizes files based on type into subfolders.
 * @param {string} sourceFolderId - Folder to organize
 */
function organizeFolder(sourceFolderId) {
  const folder = DriveApp.getFolderById(sourceFolderId);

  // Create/get subfolders
  const subfolders = {
    'Docs': getOrCreateSubfolder(folder, 'Documents'),
    'Sheets': getOrCreateSubfolder(folder, 'Spreadsheets'),
    'Slides': getOrCreateSubfolder(folder, 'Presentations'),
    'PDFs': getOrCreateSubfolder(folder, 'PDFs'),
    'Images': getOrCreateSubfolder(folder, 'Images'),
    'Other': getOrCreateSubfolder(folder, 'Other')
  };

  // Process files
  const files = folder.getFiles();
  let moved = 0;

  while (files.hasNext()) {
    const file = files.next();
    const mimeType = file.getMimeType();
    let targetFolder;

    if (mimeType === MimeType.GOOGLE_DOCS) {
      targetFolder = subfolders.Docs;
    } else if (mimeType === MimeType.GOOGLE_SHEETS) {
      targetFolder = subfolders.Sheets;
    } else if (mimeType === MimeType.GOOGLE_SLIDES) {
      targetFolder = subfolders.Slides;
    } else if (mimeType === MimeType.PDF) {
      targetFolder = subfolders.PDFs;
    } else if (mimeType.startsWith('image/')) {
      targetFolder = subfolders.Images;
    } else {
      targetFolder = subfolders.Other;
    }

    moveFile(file.getId(), targetFolder.getId());
    moved++;
  }

  Logger.log(`Organized ${moved} files`);
}

/**
 * Gets or creates a subfolder.
 */
function getOrCreateSubfolder(parent, name) {
  const existing = parent.getFoldersByName(name);
  if (existing.hasNext()) {
    return existing.next();
  }
  return parent.createFolder(name);
}
