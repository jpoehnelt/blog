/**
 * Moves a file from its current folder to a new folder.
 * @param {string} fileId - The file to move
 * @param {string} newFolderId - The destination folder
 */
function moveFile(fileId, newFolderId) {
  // Get current parents
  const file = Drive.Files.get(fileId, { fields: 'parents' });
  const previousParents = file.parents.join(',');

  // Move in one atomic operation
  Drive.Files.update(
    {},           // File metadata (none to update)
    fileId,       // File ID
    null,         // Media content (none)
    {
      addParents: newFolderId,
      removeParents: previousParents,
      fields: 'id, parents'
    }
  );

  Logger.log(`Moved file ${fileId} to folder ${newFolderId}`);
}

/**
 * Example: Move selected file to Archive folder
 */
function moveToArchive() {
  const fileId = 'YOUR_FILE_ID';
  const archiveFolderId = 'YOUR_ARCHIVE_FOLDER_ID';

  moveFile(fileId, archiveFolderId);
}
