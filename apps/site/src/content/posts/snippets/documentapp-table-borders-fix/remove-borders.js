/**
 * Removes borders from a table (sets to transparent).
 * @param {string} docId - The document ID
 * @param {number} tableStartIndex - Character index where the table starts
 * @param {number} numRows - Number of rows
 * @param {number} numCols - Number of columns
 */
function removeTableBorders(docId, tableStartIndex, numRows, numCols) {
  const noBorder = {
    color: { color: { rgbColor: { red: 1, green: 1, blue: 1 } } },
    width: { magnitude: 0, unit: 'PT' }
  };

  const requests = [{
    updateTableCellStyle: {
      tableCellStyle: {
        borderBottom: noBorder,
        borderTop: noBorder,
        borderLeft: noBorder,
        borderRight: noBorder
      },
      tableRange: {
        tableCellLocation: {
          tableStartLocation: { index: tableStartIndex },
          rowIndex: 0,
          columnIndex: 0
        },
        rowSpan: numRows,
        columnSpan: numCols
      },
      fields: 'borderBottom,borderTop,borderLeft,borderRight'
    }
  }];

  Docs.Documents.batchUpdate({ requests }, docId);
}
