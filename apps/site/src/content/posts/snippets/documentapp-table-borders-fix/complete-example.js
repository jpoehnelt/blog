/**
 * Sets red borders on the first table in the active document.
 */
function setRedBordersOnFirstTable() {
  const docId = DocumentApp.getActiveDocument().getId();
  const table = findTable(docId, 0);

  if (!table) {
    Logger.log('No table found in document');
    return;
  }

  const red = { red: 1, green: 0, blue: 0 };
  setTableBorders(docId, table.startIndex, table.rows, table.cols, red, 2);

  Logger.log(`Set red 2pt borders on table at index ${table.startIndex}`);
}

/**
 * Test function - creates a table and styles it.
 */
function testTableBorders() {
  // Create a test document with a table
  const doc = DocumentApp.create('Table Border Test');
  const body = doc.getBody();

  body.appendTable([
    ['Header 1', 'Header 2', 'Header 3'],
    ['Row 1 A', 'Row 1 B', 'Row 1 C'],
    ['Row 2 A', 'Row 2 B', 'Row 2 C']
  ]);

  doc.saveAndClose();

  // Now style it with Docs API
  const docId = doc.getId();
  const table = findTable(docId, 0);

  const blue = { red: 0, green: 0.4, blue: 0.8 };
  setTableBorders(docId, table.startIndex, table.rows, table.cols, blue, 1.5);

  Logger.log(`Created and styled: ${doc.getUrl()}`);
}
