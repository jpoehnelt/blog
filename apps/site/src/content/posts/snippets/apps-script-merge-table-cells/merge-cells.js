/**
 * Merges table cells using the Docs API.
 * @param {string} docId - The document ID
 * @param {number} tableStartIndex - Character index where the table starts
 * @param {number} startRow - Starting row (0-indexed)
 * @param {number} startCol - Starting column (0-indexed)
 * @param {number} rowSpan - Number of rows to merge
 * @param {number} colSpan - Number of columns to merge
 */
function mergeTableCells(docId, tableStartIndex, startRow, startCol, rowSpan, colSpan) {
  Docs.Documents.batchUpdate({
    requests: [{
      mergeTableCells: {
        tableRange: {
          tableCellLocation: {
            tableStartLocation: { index: tableStartIndex },
            rowIndex: startRow,
            columnIndex: startCol
          },
          rowSpan: rowSpan,
          columnSpan: colSpan
        }
      }
    }]
  }, docId);
}

/**
 * Example: Merge the first 3 columns of row 0
 */
function mergeHeaderRow() {
  const docId = DocumentApp.getActiveDocument().getId();
  const tableInfo = findFirstTable(docId);

  if (tableInfo) {
    // Merge columns 0-2 of row 0
    mergeTableCells(docId, tableInfo.startIndex, 0, 0, 1, 3);
    Logger.log('Header row merged');
  }
}
