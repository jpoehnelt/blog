/**
 * Finds the first table in a document.
 * @param {string} docId - The document ID
 * @returns {Object|null} - { startIndex, rows, cols } or null
 */
function findFirstTable(docId) {
  const doc = Docs.Documents.get(docId);

  for (const element of doc.body.content) {
    if (element.table) {
      return {
        startIndex: element.startIndex,
        rows: element.table.rows,
        cols: element.table.tableRows[0].tableCells.length
      };
    }
  }

  return null;
}
