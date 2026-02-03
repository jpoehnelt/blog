/**
 * Inserts a Table of Contents at a specific position.
 * @param {string} docId - The document ID
 * @param {number} insertionIndex - Where to insert (1 = start of doc)
 */
function insertTableOfContents(docId, insertionIndex = 1) {
  Docs.Documents.batchUpdate({
    requests: [{
      insertTableOfContents: {
        location: { index: insertionIndex }
      }
    }]
  }, docId);
}

/**
 * Inserts a TOC at the beginning of the active document.
 */
function insertTocAtStart() {
  const docId = DocumentApp.getActiveDocument().getId();
  insertTableOfContents(docId, 1);
  Logger.log('Table of Contents inserted');
}
