/**
 * Sets table borders using the Docs API.
 * @param {string} docId - The document ID
 * @param {number} tableStartIndex - Character index where the table starts
 * @param {number} numRows - Number of rows in the table
 * @param {number} numCols - Number of columns in the table
 * @param {Object} color - RGB color object { red: 0-1, green: 0-1, blue: 0-1 }
 * @param {number} widthPt - Border width in points
 */
function setTableBorders(docId, tableStartIndex, numRows, numCols, color, widthPt) {
  const borderStyle = {
    color: { color: { rgbColor: color } },
    width: { magnitude: widthPt, unit: 'PT' },
    dashStyle: 'SOLID'
  };

  const requests = [{
    updateTableCellStyle: {
      tableCellStyle: {
        borderBottom: borderStyle,
        borderTop: borderStyle,
        borderLeft: borderStyle,
        borderRight: borderStyle
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
