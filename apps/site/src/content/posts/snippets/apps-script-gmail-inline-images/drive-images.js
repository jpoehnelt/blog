/**
 * Gets an image from Google Drive for inline embedding.
 * @param {string} fileId - The Drive file ID
 * @returns {GoogleAppsScript.Base.Blob} The image blob
 */
function getImageFromDrive(fileId) {
  const file = DriveApp.getFileById(fileId);
  const blob = file.getBlob();

  // Verify it's an image
  const mimeType = blob.getContentType();
  if (!mimeType.startsWith('image/')) {
    throw new Error(`File is not an image: ${mimeType}`);
  }

  return blob;
}

/**
 * Creates a draft with an image from a Drive folder.
 */
function createDraftWithDriveImage() {
  // Find an image in a specific folder
  const folder = DriveApp.getFoldersByName('Email Images').next();
  const files = folder.getFilesByType(MimeType.PNG);

  if (!files.hasNext()) {
    Logger.log('No PNG images found');
    return;
  }

  const imageBlob = files.next().getBlob();

  GmailApp.createDraft(
    'recipient@example.com',
    'Image from Drive',
    'Fallback text',
    {
      htmlBody: '<p>Here is your image:</p><img src="cid:driveImage">',
      inlineImages: { driveImage: imageBlob }
    }
  );
}
