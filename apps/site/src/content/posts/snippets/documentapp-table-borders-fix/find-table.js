/**
 * Finds the start index of a table in a document.
 * @param {string} docId - The document ID
 * @param {number} tableNumber - Which table to find (0-indexed)
 * @returns {Object|null} - { startIndex, rows, cols } or null
 */
function findTable(docId, tableNumber = 0) {
  const doc = Docs.Documents.get(docId);
  let tableCount = 0;

  for (const element of doc.body.content) {
    if (element.table) {
      if (tableCount === tableNumber) {
        return {
          startIndex: element.startIndex,
          rows: element.table.rows,
          cols: element.table.tableRows[0].tableCells.length
        };
      }
      tableCount++;
    }
  }

  return null;
}
