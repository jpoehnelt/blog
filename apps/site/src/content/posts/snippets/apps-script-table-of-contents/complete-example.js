/**
 * Adds a custom menu for TOC management.
 */
function onOpen() {
  DocumentApp.getUi()
    .createMenu('📑 TOC')
    .addItem('Insert at Start', 'insertTocAtStart')
    .addItem('Refresh', 'refreshToc')
    .addItem('Remove', 'removeToc')
    .addToUi();
}

/**
 * Removes the Table of Contents from the document.
 */
function removeToc() {
  const docId = DocumentApp.getActiveDocument().getId();
  const doc = Docs.Documents.get(docId);

  for (const element of doc.body.content) {
    if (element.tableOfContents) {
      Docs.Documents.batchUpdate({
        requests: [{
          deleteContentRange: {
            range: {
              startIndex: element.startIndex,
              endIndex: element.endIndex
            }
          }
        }]
      }, docId);

      Logger.log('Table of Contents removed');
      return;
    }
  }

  DocumentApp.getUi().alert('No Table of Contents found');
}

/**
 * Checks if the document has a TOC.
 * @param {string} docId - The document ID
 * @returns {boolean}
 */
function hasToc(docId) {
  const doc = Docs.Documents.get(docId);
  return doc.body.content.some(el => el.tableOfContents);
}
