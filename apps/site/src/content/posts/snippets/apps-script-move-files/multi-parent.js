/**
 * Adds a file to an additional folder (true multi-parenting).
 * @param {string} fileId - The file ID
 * @param {string} additionalFolderId - Folder to add
 */
function addToFolder(fileId, additionalFolderId) {
  Drive.Files.update({}, fileId, null, {
    addParents: additionalFolderId,
    fields: 'id, parents'
  });
}

/**
 * Removes a file from a specific folder.
 * @param {string} fileId - The file ID
 * @param {string} folderId - Folder to remove from
 */
function removeFromFolder(fileId, folderId) {
  Drive.Files.update({}, fileId, null, {
    removeParents: folderId,
    fields: 'id, parents'
  });
}

/**
 * Lists all parent folders for a file.
 * @param {string} fileId - The file ID
 * @returns {string[]} Array of folder IDs
 */
function getParentFolders(fileId) {
  const file = Drive.Files.get(fileId, { fields: 'parents' });
  return file.parents || [];
}

/**
 * Consolidates a file to a single folder (removes from all others).
 * @param {string} fileId - The file ID
 * @param {string} targetFolderId - The folder to keep
 */
function consolidateToFolder(fileId, targetFolderId) {
  const currentParents = getParentFolders(fileId);
  const parentsToRemove = currentParents
    .filter(p => p !== targetFolderId)
    .join(',');

  if (parentsToRemove) {
    Drive.Files.update({}, fileId, null, {
      addParents: targetFolderId,
      removeParents: parentsToRemove,
      fields: 'id, parents'
    });
  }
}
