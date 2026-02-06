/**
 * Moves a file within or to a Shared Drive.
 * @param {string} fileId - The file to move
 * @param {string} newFolderId - The destination folder
 */
function moveFileSharedDrive(fileId, newFolderId) {
  const file = Drive.Files.get(fileId, {
    fields: 'parents',
    supportsAllDrives: true
  });

  const previousParents = file.parents.join(',');

  Drive.Files.update({}, fileId, null, {
    addParents: newFolderId,
    removeParents: previousParents,
    supportsAllDrives: true,  // Required for Shared Drives
    fields: 'id, parents'
  });

  Logger.log(`Moved file to Shared Drive folder`);
}

/**
 * Copies a file to a Shared Drive (moving between drives requires copy).
 * @param {string} fileId - Source file ID
 * @param {string} targetFolderId - Destination folder in Shared Drive
 * @returns {string} New file ID
 */
function copyToSharedDrive(fileId, targetFolderId) {
  const copiedFile = Drive.Files.copy(
    { parents: [targetFolderId] },
    fileId,
    { supportsAllDrives: true }
  );

  Logger.log(`Copied file to Shared Drive: ${copiedFile.id}`);
  return copiedFile.id;
}
