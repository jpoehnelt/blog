/**
 * Unmerges previously merged table cells.
 * @param {string} docId - The document ID
 * @param {number} tableStartIndex - Character index where the table starts
 * @param {number} startRow - Starting row (0-indexed)
 * @param {number} startCol - Starting column (0-indexed)
 * @param {number} rowSpan - Number of rows in the merged region
 * @param {number} colSpan - Number of columns in the merged region
 */
function unmergeTableCells(docId, tableStartIndex, startRow, startCol, rowSpan, colSpan) {
  Docs.Documents.batchUpdate({
    requests: [{
      unmergeTableCells: {
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
 * Example: Unmerge the header row
 */
function unmergeHeaderRow() {
  const docId = DocumentApp.getActiveDocument().getId();
  const tableInfo = findFirstTable(docId);

  if (tableInfo) {
    unmergeTableCells(docId, tableInfo.startIndex, 0, 0, 1, tableInfo.cols);
    Logger.log('Header row unmerged');
  }
}
