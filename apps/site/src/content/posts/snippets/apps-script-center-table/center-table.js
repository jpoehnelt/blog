/**
 * Centers a table by setting column widths to distribute evenly.
 * @param {string} docId - The document ID
 * @param {number} tableStartIndex - Character index where the table starts
 */
function centerTable(docId, tableStartIndex) {
  Docs.Documents.batchUpdate({
    requests: [{
      updateTableColumnProperties: {
        tableStartLocation: { index: tableStartIndex },
        columnIndices: [],  // Empty = apply to all columns
        tableColumnProperties: {
          widthType: 'EVENLY_DISTRIBUTED'
        },
        fields: 'widthType'
      }
    }]
  }, docId);
}

/**
 * Centers the first table in the active document.
 */
function centerFirstTable() {
  const docId = DocumentApp.getActiveDocument().getId();
  const doc = Docs.Documents.get(docId);

  for (const element of doc.body.content) {
    if (element.table) {
      centerTable(docId, element.startIndex);
      Logger.log('Table centered');
      return;
    }
  }

  Logger.log('No table found');
}
