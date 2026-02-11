/**
 * Refreshes an existing Table of Contents by deleting and recreating it.
 * @param {string} docId - The document ID
 */
function refreshTableOfContents(docId) {
  const doc = Docs.Documents.get(docId);

  // Find the TOC element
  for (const element of doc.body.content) {
    if (element.tableOfContents) {
      const startIndex = element.startIndex;
      const endIndex = element.endIndex;

      // Delete the existing TOC
      Docs.Documents.batchUpdate({
        requests: [{
          deleteContentRange: {
            range: { startIndex, endIndex }
          }
        }]
      }, docId);

      // Insert a new TOC at the same position
      Docs.Documents.batchUpdate({
        requests: [{
          insertTableOfContents: {
            location: { index: startIndex }
          }
        }]
      }, docId);

      Logger.log('Table of Contents refreshed');
      return;
    }
  }

  Logger.log('No Table of Contents found to refresh');
}

/**
 * Refreshes the TOC in the active document.
 */
function refreshToc() {
  const docId = DocumentApp.getActiveDocument().getId();
  refreshTableOfContents(docId);
}
