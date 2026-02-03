/**
 * Sets fixed column widths on a table.
 * @param {string} docId - The document ID
 * @param {number} tableStartIndex - Character index where the table starts
 * @param {number[]} widthsPt - Array of widths in points for each column
 */
function setColumnWidths(docId, tableStartIndex, widthsPt) {
  const requests = widthsPt.map((width, index) => ({
    updateTableColumnProperties: {
      tableStartLocation: { index: tableStartIndex },
      columnIndices: [index],
      tableColumnProperties: {
        widthType: 'FIXED_WIDTH',
        width: { magnitude: width, unit: 'PT' }
      },
      fields: 'widthType,width'
    }
  }));

  Docs.Documents.batchUpdate({ requests }, docId);
}

/**
 * Example: 3-column table with specific widths
 */
function setCustomWidths() {
  const docId = DocumentApp.getActiveDocument().getId();
  const doc = Docs.Documents.get(docId);

  for (const element of doc.body.content) {
    if (element.table) {
      // 100pt, 200pt, 100pt columns
      setColumnWidths(docId, element.startIndex, [100, 200, 100]);
      Logger.log('Column widths set');
      return;
    }
  }
}
