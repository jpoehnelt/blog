/**
 * Creates an invoice with merged header cells.
 */
function createInvoice() {
  const doc = DocumentApp.create('Invoice #1001');
  const body = doc.getBody();

  // Create the table structure
  const table = body.appendTable([
    ['INVOICE', '', '', ''],           // Will merge across all columns
    ['Item', 'Qty', 'Price', 'Total'],
    ['Widget A', '2', '$10.00', '$20.00'],
    ['Widget B', '1', '$25.00', '$25.00'],
    ['', '', 'Subtotal:', '$45.00'],
    ['', '', 'Tax (8%):', '$3.60'],
    ['', '', 'Total:', '$48.60']
  ]);

  doc.saveAndClose();

  const docId = doc.getId();
  const tableInfo = findFirstTable(docId);

  // Merge the header row (row 0, all 4 columns)
  mergeTableCells(docId, tableInfo.startIndex, 0, 0, 1, 4);

  // Merge empty cells in subtotal rows (cols 0-1)
  mergeTableCells(docId, tableInfo.startIndex, 4, 0, 1, 2);
  mergeTableCells(docId, tableInfo.startIndex, 5, 0, 1, 2);
  mergeTableCells(docId, tableInfo.startIndex, 6, 0, 1, 2);

  Logger.log(`Invoice created: ${doc.getUrl()}`);
}
